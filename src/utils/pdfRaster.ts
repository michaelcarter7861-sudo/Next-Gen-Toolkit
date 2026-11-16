/**
 * PDF → image rasterisation, orchestration layer.
 *
 * This module contains no DOM and no pdf.js import so the orchestration, page
 * selection and naming logic can be executed and tested in Node against a real
 * PDF engine (see `pdfRaster.test.ts`). The browser-specific adapters live in
 * `pdfRasterBrowser.ts` and are only loaded when the tool is actually used.
 */

export interface RasterOptions {
  /** Page spec: "all", "1-3,5", "2". Sanitised by parsePageSelection. */
  pages?: string;
  /** 72 = 1:1 with PDF points. Clamped to 72..600. */
  dpi?: number;
  format?: 'image/png' | 'image/jpeg' | 'image/webp';
  quality?: number;
  /** Guard rail so a 400-page scan cannot exhaust device memory. */
  maxPages?: number;
  /** Used for output filenames. */
  baseName?: string;
  /** Override the per-document pixel budget (tests and constrained devices). */
  maxPixels?: number;
}

export interface RasterPageResult {
  pageNumber: number;
  width: number;
  height: number;
  /** Effective DPI after the memory guard, which may be below the requested DPI. */
  dpi: number;
  /** True when the requested DPI was lowered to keep the canvas inside memory limits. */
  dpiReduced: boolean;
  sizeBytes: number;
  /** The format the encoder actually produced (browsers can substitute). */
  mime: string;
  name: string;
  bytes: Uint8Array;
}

export interface PdfPageLike {
  getViewport: (params: { scale: number }) => { width: number; height: number };
  render: (params: Record<string, unknown>) => { promise: Promise<void> };
  cleanup?: () => void;
}

export interface PdfDocLike {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfPageLike>;
  destroy: () => Promise<void>;
}

export interface CanvasLike {
  width: number;
  height: number;
  getContext: (type: '2d') => unknown;
}

export interface RasterAdapters {
  loadPdf: (bytes: Uint8Array) => Promise<PdfDocLike>;
  createCanvas: (width: number, height: number) => CanvasLike;
  encode: (
    canvas: CanvasLike,
    format: 'image/png' | 'image/jpeg' | 'image/webp',
    quality: number
  ) => Promise<{ bytes: Uint8Array; mime: string }>;
}

export const MAX_RASTER_PAGES = 50;

/**
 * A single canvas above this many pixels can exhaust memory on a mid-range
 * phone (32 MP ≈ 128 MB as RGBA). Larger requests are rendered at a lower DPI
 * and the reduction is reported instead of silently downscaling.
 */
export const MAX_CANVAS_PIXELS = 32_000_000;

/**
 * Per-document pixel budget. A single safe canvas is not enough: forty 8 MP
 * pages plus the ZIP of their PNGs can exhaust a phone even though every
 * individual page is legal. Rendering stops here and the shortfall is reported
 * instead of failing halfway with a blank tab.
 */
export const MAX_DOCUMENT_PIXELS = 120_000_000;

/**
 * Turn a user typed page selection into zero-based page indices.
 * Throws on anything it cannot interpret rather than silently rendering page 1.
 */
export function parsePageSelection(spec: string | undefined, pageCount: number): number[] {
  if (pageCount <= 0) throw new Error('This PDF contains no pages.');
  const raw = (spec ?? '').trim().toLowerCase();
  if (!raw || raw === 'all') return Array.from({ length: pageCount }, (_, i) => i);

  const indices = new Set<number>();
  for (const chunk of raw.split(',')) {
    const part = chunk.trim();
    if (!part) continue;
    const range = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start) {
        throw new Error(`"${part}" is not a valid page range. Use 1-3, 5.`);
      }
      for (let page = start; page <= Math.min(end, pageCount); page++) indices.add(page - 1);
      continue;
    }
    if (/^\d+$/.test(part)) {
      const page = Number(part);
      if (page < 1 || page > pageCount) {
        throw new Error(`Page ${page} does not exist in this ${pageCount}-page PDF.`);
      }
      indices.add(page - 1);
      continue;
    }
    throw new Error(`"${part}" is not a valid page selection. Use 1-3, 5 or all.`);
  }

  const sorted = [...indices].sort((a, b) => a - b);
  if (sorted.length === 0) throw new Error('No valid pages were selected.');
  return sorted;
}

export function clampDpi(dpi: number | undefined): number {
  const value = Number.isFinite(dpi) ? Number(dpi) : 150;
  return Math.min(600, Math.max(72, Math.round(value)));
}

export function dpiToScale(dpi: number): number {
  return clampDpi(dpi) / 72;
}

function extensionFor(mime: string): string {
  const normalised = (mime || '').toLowerCase();
  if (normalised.includes('png')) return 'png';
  if (normalised.includes('webp')) return 'webp';
  return 'jpg';
}

function safeBase(name: string | undefined): string {
  const base = (name ?? 'document').replace(/\.[^.]+$/, '').replace(/[^\w.-]+/g, '-');
  return base || 'document';
}

/** Render the selected pages of a PDF to real image bytes. */
export async function renderPdfPages(
  bytes: Uint8Array,
  options: RasterOptions,
  adapters: RasterAdapters
): Promise<{
  pages: RasterPageResult[];
  pageCount: number;
  skipped: number;
  /** Why the run stopped early, when it did. */
  truncatedReason: 'page-cap' | 'pixel-budget' | null;
}> {
  const format: 'image/png' | 'image/jpeg' | 'image/webp' =
    options.format === 'image/jpeg'
      ? 'image/jpeg'
      : options.format === 'image/webp'
        ? 'image/webp'
        : 'image/png';
  const quality = Math.min(1, Math.max(0.4, options.quality ?? 0.92));
  const maxPages = options.maxPages ?? MAX_RASTER_PAGES;
  const requestedScale = dpiToScale(options.dpi ?? 150);
  const base = safeBase(options.baseName);

  const doc = await adapters.loadPdf(bytes);
  try {
    const selection = parsePageSelection(options.pages, doc.numPages);
    const rendered: RasterPageResult[] = [];
    let skipped = 0;
    let spentPixels = 0;
    let limitReason: 'page-cap' | 'pixel-budget' | null = null;

    for (const pageIndex of selection) {
      if (rendered.length >= maxPages) {
        skipped = selection.length - rendered.length;
        limitReason = 'page-cap';
        break;
      }
      const page = await doc.getPage(pageIndex + 1);
      const baseViewport = page.getViewport({ scale: 1 });
      let scale = requestedScale;
      let dpiReduced = false;
      // A 2% margin covers ceil() rounding: without it a canvas can land a few
      // thousand pixels above the limit and defeat the guard.
      const pixelBudget = MAX_CANVAS_PIXELS * 0.98;
      if (baseViewport.width * baseViewport.height * scale * scale > pixelBudget) {
        scale = Math.sqrt(pixelBudget / (baseViewport.width * baseViewport.height));
        dpiReduced = true;
      }
      const viewport = page.getViewport({ scale });
      const width = Math.max(1, Math.ceil(viewport.width));
      const height = Math.max(1, Math.ceil(viewport.height));
      if (spentPixels + width * height > (options.maxPixels ?? MAX_DOCUMENT_PIXELS)) {
        skipped = selection.length - rendered.length;
        limitReason = 'pixel-budget';
        break;
      }
      spentPixels += width * height;
      const canvas = adapters.createCanvas(width, height);
      const ctx = canvas.getContext('2d') as
        | { fillStyle: string; fillRect: (x: number, y: number, w: number, h: number) => void }
        | null;
      if (!ctx) throw new Error('This browser could not provide a 2D canvas context.');
      // PDF pages are transparent by default; JPEG would render that as black.
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      await page.render({ canvasContext: ctx, viewport, canvas } as unknown as Record<
        string,
        unknown
      >).promise;

      const encoded = await adapters.encode(canvas, format, quality);
      const actualMime = encoded.mime || format;
      rendered.push({
        pageNumber: pageIndex + 1,
        width,
        height,
        dpi: Math.round(scale * 72),
        dpiReduced,
        sizeBytes: encoded.bytes.byteLength,
        mime: actualMime,
        name: `${base}-page-${String(pageIndex + 1).padStart(2, '0')}.${extensionFor(actualMime)}`,
        bytes: encoded.bytes,
      });
      // Free page resources between renders (important on low-memory devices).
      page.cleanup?.();
    }

    return {
      pages: rendered,
      pageCount: doc.numPages,
      skipped,
      truncatedReason: skipped > 0 ? limitReason : null,
    };
  } finally {
    await doc.destroy().catch(() => undefined);
  }
}
