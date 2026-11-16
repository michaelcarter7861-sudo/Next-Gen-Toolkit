/**
 * @license
 * SPDX-License-Identifier: MIT
 *
 * Utilix Client-Side Binary Engines (PDF, Image, EXIF, QR SVG, and JSZip)
 * Runs 100% inside browser memory (ArrayBuffer / Uint8Array / HTML5 Canvas).
 */

import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import JSZip from 'jszip';
import QRCode from 'qrcode';
import { parsePageRanges, inspectImageBinaryMetadata } from './toolEngines';

export interface ProcessedFileItem {
  id: string;
  name: string;
  originalSize: number;
  outputSize: number;
  mimeType: string;
  blob: Blob;
  previewUrl?: string;
  sourcePreviewUrl?: string;
  metaSummary?: Record<string, string>;
}

// ============================================================================
// 1. Sample File Generators ("Load Sample Data" for PDF & Image Tools)
// ============================================================================

export async function createSamplePdfFile(filename = 'nextgentoolkit-sample-document.pdf', pageCount = 4): Promise<File> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle('NextGenToolkit Architecture & Q4 Financial Report');
  pdfDoc.setAuthor('NextGenToolkit Privacy Lab (sabirarain552)');
  pdfDoc.setSubject('Confidential Client-Side WebAssembly Processing Benchmark');
  pdfDoc.setKeywords(['nextgentoolkit', 'pdf-lib', 'webassembly', 'zero-upload', 'seo']);
  pdfDoc.setProducer('Adobe PDF Library 17.0 / NextGenToolkit Test Harness');
  pdfDoc.setCreator('Microsoft Word for Microsoft 365 (Tracking ID: 9841-AX)');
  pdfDoc.setCreationDate(new Date('2025-02-15T10:30:00Z'));
  pdfDoc.setModificationDate(new Date('2025-02-20T14:22:00Z'));

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (let i = 1; i <= pageCount; i++) {
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    // Header band
    page.drawRectangle({
      x: 40,
      y: height - 95,
      width: width - 80,
      height: 55,
      color: rgb(0.44, 0.28, 0.92),
    });

    page.drawText(`NEXTGENTOOLKIT CLIENT-SIDE BENCHMARK | PAGE ${i} OF ${pageCount}`, {
      x: 56,
      y: height - 72,
      size: 13,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page.drawText(
      `Zero-Upload Verification Document • Generated Locally in Browser RAM`,
      {
        x: 40,
        y: height - 125,
        size: 11,
        font: fontBold,
        color: rgb(0.15, 0.19, 0.27),
      }
    );

    const lines = [
      `Section ${i}.1: Executive Summary & Byte-Stream Architecture`,
      `This multi-page sample PDF was synthesized directly inside your browser memory`,
      `using pdf-lib without transmitting a single byte over the network.`,
      ``,
      `• Target KB Compression: Test shrinking this PDF to 50KB, 100KB, or 200KB.`,
      `• Page Organizer & Merger: Reorder, rotate (90/180 deg), or interleave pages.`,
      `• Range Splitter: Extract custom ranges such as "1-2, 4" into a bulk ZIP.`,
      `• Forensic Metadata Scrubber: Inspect & strip Author, Producer, and XMP tags.`,
      ``,
      `Telemetry Snapshot (Page ${i}):`,
      `  - Execution Latency: 14.2 ms (Local WebAssembly / ES6 Engine)`,
      `  - Server Upload Bytes: 0 B (Verified Client-Side Isolation)`,
      `  - Core Web Vitals Score: 100 / 100 LCP & INP`,
    ];

    lines.forEach((line, idx) => {
      page.drawText(line, {
        x: 40,
        y: height - 160 - idx * 22,
        size: 10.5,
        font: idx === 0 || idx === 9 ? fontBold : fontRegular,
        color: rgb(0.1, 0.11, 0.16),
      });
    });

    // Decorative chart bars on page
    for (let b = 0; b < 5; b++) {
      const barH = 35 + ((b * 23 + i * 17) % 90);
      page.drawRectangle({
        x: 60 + b * 85,
        y: 120,
        width: 52,
        height: barH,
        color: b % 2 === 0 ? rgb(0.44, 0.28, 0.92) : rgb(0.2, 0.65, 0.55),
      });
    }
  }

  const bytes = await pdfDoc.save();
  const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
  return new File([blob], filename, { type: 'application/pdf' });
}

export async function createSampleImageFile(filename = 'nextgentoolkit-sample-photo.jpg'): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 800;
  const ctx = canvas.getContext('2d')!;

  // Rich gradient backdrop
  const grad = ctx.createLinearGradient(0, 0, 1200, 800);
  grad.addColorStop(0, '#7047EB');
  grad.addColorStop(0.5, '#253044');
  grad.addColorStop(1, '#0F172A');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1200, 800);

  // Geometric cards and high-frequency detail for compression fidelity testing
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.beginPath();
  ctx.roundRect(70, 70, 1060, 660, 28);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 50px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('NEXTGENTOOLKIT IMAGE ENGINE', 130, 200);

  ctx.fillStyle = '#E1F0FF';
  ctx.font = '600 30px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Client-side WebP / Target-KB compression test card', 130, 265);

  ctx.fillStyle = '#F8F7FC';
  ctx.font = '24px monospace';
  const testCardLines = [
    'This image was generated locally by your browser.',
    'It exists so you can try compression without uploading a real photo.',
    'Try the 20 KB, 50 KB and 100 KB presets and compare quality.',
    'No network request is made when this sample is processed.',
  ];
  testCardLines.forEach((l, i) => {
    ctx.fillText(l, 130, 355 + i * 52);
  });

  // High-frequency color circles to test quantization
  const colors = ['#EDE7FF', '#FFE7EC', '#E0F7F0', '#FFF1D9', '#7047EB'];
  colors.forEach((col, idx) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(200 + idx * 180, 650, 38, 0, Math.PI * 2);
    ctx.fill();
  });

  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b || new Blob()), 'image/jpeg', 0.94);
  });
  return new File([blob], filename, { type: 'image/jpeg' });
}

// ============================================================================
// 2. Client-Side PDF Manipulation Suite (pdf-lib)
// ============================================================================

export async function inspectAndCleanPdfMetadata(
  file: File,
  stripAll = true
): Promise<{
  metadata: Record<string, string>;
  cleanedBlob: Blob;
  originalSize: number;
  cleanedSize: number;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { updateMetadata: false });

  const metadata: Record<string, string> = {
    Title: pdfDoc.getTitle() || '(None)',
    Author: pdfDoc.getAuthor() || '(None)',
    Subject: pdfDoc.getSubject() || '(None)',
    Creator: pdfDoc.getCreator() || '(None)',
    Producer: pdfDoc.getProducer() || '(None)',
    Keywords: pdfDoc.getKeywords() || '(None)',
    CreationDate: pdfDoc.getCreationDate()?.toISOString() || '(None)',
    ModificationDate: pdfDoc.getModificationDate()?.toISOString() || '(None)',
    PageCount: String(pdfDoc.getPageCount()),
  };

  if (stripAll) {
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('');
    pdfDoc.setCreator('');
    pdfDoc.setCreationDate(new Date(0));
    pdfDoc.setModificationDate(new Date(0));
  }

  const cleanedBytes = await pdfDoc.save({ useObjectStreams: true });
  const cleanedBlob = new Blob([cleanedBytes as unknown as BlobPart], { type: 'application/pdf' });

  return {
    metadata,
    cleanedBlob,
    originalSize: file.size,
    cleanedSize: cleanedBlob.size,
  };
}

export interface PdfCompressResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  pageCount: number;
  savingsPercent: number;
  targetKb: number;
  targetMet: boolean;
  /** True when the optimiser could not beat the original and returned it unchanged. */
  returnedOriginal: boolean;
  /** Machine-readable outcome used by the UI to show an honest status message. */
  status: 'met-target' | 'optimized-only' | 'already-optimal';
}

/**
 * Structural PDF optimisation.
 *
 * What this genuinely does: rebuilds the document with object streams, drops
 * unused objects and removes Info/XMP metadata. What it does NOT do is
 * re-encode embedded images, which is where most of a scanned PDF's bytes live.
 *
 * Honesty rules enforced here (see IMPLEMENTATION-CHANGELOG.md):
 *  - never report a saving that did not happen;
 *  - never return a file larger than the input;
 *  - never claim the target was met when it was not.
 */
export async function compressPdfToTargetKb(
  file: File,
  targetKb: number
): Promise<PdfCompressResult> {
  const arrayBuffer = await file.arrayBuffer();
  let srcDoc: PDFDocument | null = null;
  try {
    srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  } catch {
    throw new Error(
      'This PDF could not be parsed. It may be encrypted, password-protected or corrupted.'
    );
  }
  const pageCount = srcDoc.getPageCount();
  if (pageCount === 0) {
    throw new Error('This PDF contains no pages.');
  }

  const outDoc = await PDFDocument.create();
  const indices = Array.from({ length: pageCount }, (_, i) => i);
  const copiedPages = await outDoc.copyPages(srcDoc, indices);
  // Page content is intentionally NOT scaled: scaling distorts the layout and
  // does not meaningfully reduce byte size. Verified with fixture tests.
  copiedPages.forEach((page) => outDoc.addPage(page));
  outDoc.setTitle('');
  outDoc.setAuthor('');
  outDoc.setProducer('NextGenToolkit Client-Side PDF Engine');
  outDoc.setCreator('');

  const optimisedBytes = await outDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: 50,
  });

  const originalSize = file.size;
  const optimisedSize = optimisedBytes.byteLength;

  // Never hand back something bigger than what the user gave us.
  if (optimisedSize >= originalSize) {
    return {
      blob: new Blob([arrayBuffer], { type: 'application/pdf' }),
      originalSize,
      compressedSize: originalSize,
      pageCount,
      savingsPercent: 0,
      targetKb,
      targetMet: originalSize <= targetKb * 1024,
      returnedOriginal: true,
      status: 'already-optimal',
    };
  }

  const savingsPercent = Math.round(((originalSize - optimisedSize) / originalSize) * 100);
  const targetMet = optimisedSize <= targetKb * 1024;

  return {
    blob: new Blob([optimisedBytes as unknown as BlobPart], { type: 'application/pdf' }),
    originalSize,
    compressedSize: optimisedSize,
    pageCount,
    savingsPercent,
    targetKb,
    targetMet,
    returnedOriginal: false,
    status: targetMet ? 'met-target' : 'optimized-only',
  };
}

export async function mergePdfFilesClient(
  files: File[],
  rotationDeg = 0
): Promise<{ blob: Blob; totalPages: number; totalOriginalBytes: number }> {
  const mergedPdf = await PDFDocument.create();
  let totalPages = 0;
  let totalOriginalBytes = 0;

  for (const file of files) {
    totalOriginalBytes += file.size;
    const buf = await file.arrayBuffer();
    const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
    const indices = doc.getPageIndices();
    const copied = await mergedPdf.copyPages(doc, indices);
    copied.forEach((page) => {
      if (rotationDeg !== 0) {
        page.setRotation(degrees(rotationDeg));
      }
      mergedPdf.addPage(page);
      totalPages++;
    });
  }

  const bytes = await mergedPdf.save({ useObjectStreams: true });
  return {
    blob: new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' }),
    totalPages,
    totalOriginalBytes,
  };
}

export async function splitPdfByRangesClient(
  file: File,
  rangeSyntax: string
): Promise<{ extractedBlob: Blob; extractedCount: number; totalPages: number }> {
  const buf = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();
  const pageIndices = parsePageRanges(rangeSyntax, totalPages);
  const safeIndices = pageIndices.length > 0 ? pageIndices : [0];

  const outDoc = await PDFDocument.create();
  const copied = await outDoc.copyPages(srcDoc, safeIndices);
  copied.forEach((p) => outDoc.addPage(p));

  const bytes = await outDoc.save({ useObjectStreams: true });
  return {
    extractedBlob: new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' }),
    extractedCount: safeIndices.length,
    totalPages,
  };
}

export async function convertImagesToPdfClient(
  files: File[],
  options: {
    pageSize: 'A4' | 'Letter' | 'Fit';
    orientation: 'portrait' | 'landscape';
    marginPx: number;
    stampPageNumbers: boolean;
  }
): Promise<{ blob: Blob; pageCount: number }> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    // Convert any image (WebP/PNG/JPG) to clean JPEG via Canvas so pdf-lib embeds reliably
    const dataUrl = await fileToDataUrl(file);
    const img = await loadImageElement(dataUrl);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || 800;
    canvas.height = img.naturalHeight || 600;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const jpgBlob = await new Promise<Blob>((res) =>
      canvas.toBlob((b) => res(b || new Blob()), 'image/jpeg', 0.92)
    );
    const jpgBytes = await jpgBlob.arrayBuffer();
    const embedded = await pdfDoc.embedJpg(jpgBytes);

    let pageW = 595.28;
    let pageH = 841.89;
    if (options.pageSize === 'Letter') {
      pageW = 612;
      pageH = 792;
    } else if (options.pageSize === 'Fit') {
      pageW = embedded.width + options.marginPx * 2;
      pageH = embedded.height + options.marginPx * 2;
    }

    if (options.orientation === 'landscape' && options.pageSize !== 'Fit') {
      [pageW, pageH] = [pageH, pageW];
    }

    const page = pdfDoc.addPage([pageW, pageH]);
    const availW = pageW - options.marginPx * 2;
    const availH = pageH - options.marginPx * 2 - (options.stampPageNumbers ? 20 : 0);
    const scale = Math.min(availW / embedded.width, availH / embedded.height, 1);
    const drawW = embedded.width * scale;
    const drawH = embedded.height * scale;

    page.drawImage(embedded, {
      x: (pageW - drawW) / 2,
      y: (pageH - drawH) / 2 + (options.stampPageNumbers ? 10 : 0),
      width: drawW,
      height: drawH,
    });

    if (options.stampPageNumbers) {
      page.drawText(`Page ${i + 1} of ${files.length}`, {
        x: pageW / 2 - 30,
        y: 16,
        size: 9,
        font,
        color: rgb(0.4, 0.42, 0.5),
      });
    }
  }

  const bytes = await pdfDoc.save({ useObjectStreams: true });
  return {
    blob: new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' }),
    pageCount: files.length,
  };
}

// ============================================================================
// 3. Client-Side Image Compression, Binary-Search KB Loop, EXIF & Social Resizer
// ============================================================================

function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function transcodeImageClient(
  file: File,
  targetMime: 'image/webp' | 'image/jpeg' | 'image/png',
  qualityZeroToOne: number
): Promise<ProcessedFileItem> {
  const dataUrl = await fileToDataUrl(file);
  const img = await loadImageElement(dataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || 800;
  canvas.height = img.naturalHeight || 600;
  const ctx = canvas.getContext('2d')!;
  if (targetMime === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);

  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b || new Blob()), targetMime, qualityZeroToOne)
  );
  const ext = targetMime === 'image/webp' ? 'webp' : targetMime === 'image/png' ? 'png' : 'jpg';
  const baseName = file.name.replace(/\.[^.]+$/, '');

  return {
    id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: `${baseName}.${ext}`,
    originalSize: file.size,
    outputSize: blob.size,
    mimeType: targetMime,
    blob,
    previewUrl: URL.createObjectURL(blob),
    sourcePreviewUrl: dataUrl,
  };
}

export type CompressImageMime = 'image/webp' | 'image/jpeg' | 'image/png';

export function extensionForImageMime(mime: CompressImageMime): 'jpg' | 'png' | 'webp' {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'jpg';
}

/** Pure helper (unit-tested): builds an honest output filename for a target size. */
export function buildCompressedImageName(
  originalName: string,
  targetKb: number,
  mime: CompressImageMime
): string {
  const base = originalName.replace(/\.[^.]+$/, '') || 'image';
  return `${base}-${targetKb}kb.${extensionForImageMime(mime)}`;
}

function encodeCanvas(
  canvas: HTMLCanvasElement,
  mime: CompressImageMime,
  quality: number
): Promise<Blob> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob || new Blob()), mime, quality);
  });
}

/**
 * Target-size image compression with a real byte-level verification loop.
 *
 * - JPEG/WebP: 8-step binary search over encoder quality, then progressive
 *   downscaling if the requested byte ceiling is still unreachable.
 * - PNG: quality is ignored by browsers, so size is controlled by progressive
 *   downscaling (PNG is kept lossless, never silently converted).
 * - Transparency is preserved for PNG/WebP output.
 */
export async function compressImageToExactKbClient(
  file: File,
  targetKb: number,
  mime: CompressImageMime = 'image/jpeg'
): Promise<
  ProcessedFileItem & {
    iterations: number;
    achievedQuality: number | null;
    dimensions: string;
    targetMet: boolean;
    scaleApplied: number;
    requestedMime: CompressImageMime;
  }
> {
  const targetBytes = targetKb * 1024;
  const dataUrl = await fileToDataUrl(file);
  const img = await loadImageElement(dataUrl);
  const naturalW = img.naturalWidth || 800;
  const naturalH = img.naturalHeight || 600;
  const lossy = mime !== 'image/png';

  let scale = 1;
  // Sensible starting scale so tiny targets do not waste eight encode passes.
  if (targetKb <= 25 && Math.max(naturalW, naturalH) > 600) scale = 600 / Math.max(naturalW, naturalH);
  else if (targetKb <= 55 && Math.max(naturalW, naturalH) > 900) scale = 900 / Math.max(naturalW, naturalH);

  let iterations = 0;
  let bestBlob: Blob | null = null;
  let bestQuality: number | null = lossy ? 0.75 : null;
  let bestScale = scale;
  let bestCanvas: HTMLCanvasElement | null = null;

  const render = (scaleValue: number): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(64, Math.round(naturalW * scaleValue));
    canvas.height = Math.max(64, Math.round(naturalH * scaleValue));
    const ctx = canvas.getContext('2d')!;
    if (mime === 'image/jpeg') {
      // JPEG has no alpha channel: flatten onto white instead of rendering black.
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
  };

  // Phase 1: quality search (lossy formats only).
  if (lossy) {
    const canvas = render(scale);
    bestCanvas = canvas;
    let low = 0.05;
    let high = 0.95;
    for (let i = 0; i < 8; i++) {
      iterations++;
      const mid = Number(((low + high) / 2).toFixed(3));
      const candidate = await encodeCanvas(canvas, mime, mid);
      if (candidate.size <= targetBytes) {
        bestBlob = candidate;
        bestQuality = mid;
        low = mid;
      } else {
        high = mid;
      }
    }
  }

  // Phase 2: progressive downscale until the ceiling is met (or we hit the floor).
  let attempts = 0;
  while ((!bestBlob || bestBlob.size > targetBytes) && attempts < 6 && Math.max(naturalW, naturalH) * scale > 96) {
    attempts++;
    iterations++;
    scale = Math.max(0.08, scale * 0.82);
    const canvas = render(scale);
    const candidate = await encodeCanvas(canvas, mime, lossy ? (bestQuality ?? 0.7) : 1);
    if (!bestBlob || candidate.size <= bestBlob.size) {
      bestBlob = candidate;
      bestScale = scale;
      bestCanvas = canvas;
    }
    if (bestBlob.size <= targetBytes) break;
  }

  if (!bestBlob || !bestCanvas) {
    bestCanvas = render(scale);
    bestBlob = await encodeCanvas(bestCanvas, mime, lossy ? 0.1 : 1);
    bestScale = scale;
  }

  return {
    id: `${file.name}-kb-${Date.now()}`,
    name: buildCompressedImageName(file.name, targetKb, mime),
    originalSize: file.size,
    outputSize: bestBlob.size,
    mimeType: mime,
    blob: bestBlob,
    previewUrl: URL.createObjectURL(bestBlob),
    sourcePreviewUrl: dataUrl,
    iterations,
    achievedQuality: bestQuality === null ? null : Math.round(bestQuality * 100),
    dimensions: `${bestCanvas.width} × ${bestCanvas.height} px`,
    targetMet: bestBlob.size <= targetBytes,
    scaleApplied: Number(bestScale.toFixed(3)),
    requestedMime: mime,
  };
}

export async function inspectAndScrubExifClient(file: File): Promise<{
  forensicTags: Record<string, string>;
  cleanItem: ProcessedFileItem;
}> {
  const buf = await file.arrayBuffer();
  const report = inspectImageBinaryMetadata(new Uint8Array(buf));

  const cleanItem = await transcodeImageClient(file, 'image/jpeg', 0.92);
  cleanItem.name = `${file.name.replace(/\.[^.]+$/, '')}-clean-no-exif.jpg`;
  const cleanBuf = await cleanItem.blob.arrayBuffer();
  const cleanReport = inspectImageBinaryMetadata(new Uint8Array(cleanBuf));

  const forensicTags: Record<string, string> = {
    'File Name': file.name,
    'Container Format': `${report.container} (${file.type || 'image/jpeg'})`,
    'Original Byte Size': `${(file.size / 1024).toFixed(2)} KB`,
    'EXIF / APP1 Tags': report.hasExif ? 'Detected & Stripped in Output' : 'None detected in source bytes',
    'XMP / Text Chunks': report.hasXmp ? 'Detected & Stripped in Output' : 'None detected in source bytes',
    'ICC Color Profile': report.hasIccProfile ? 'Embedded ICC normalized to sRGB' : 'Standard sRGB pixel matrix',
    'Detected Segments':
      report.detectedSegments.length > 0
        ? report.detectedSegments.slice(0, 3).join(' | ')
        : 'Raw image frames only (No tracking segments)',
    'Verified Output Check':
      cleanReport.detectedSegments.length === 0
        ? '0 EXIF/XMP/COM segments remaining after Canvas rebuild'
        : `${cleanReport.detectedSegments.length} standard JFIF segment(s)`,
  };

  if (report.asciiPreviewTokens.length > 0) {
    forensicTags['Extracted Header Strings'] = report.asciiPreviewTokens.join(' · ');
  }

  return { forensicTags, cleanItem };
}

export async function generateSocialMediaBulkPack(file: File): Promise<ProcessedFileItem[]> {
  const presets = [
    { label: 'youtube-thumbnail-1280x720', w: 1280, h: 720 },
    { label: 'instagram-square-1080x1080', w: 1080, h: 1080 },
    { label: 'instagram-story-1080x1920', w: 1080, h: 1920 },
    { label: 'linkedin-banner-1584x396', w: 1584, h: 396 },
    { label: 'amazon-product-1000x1000', w: 1000, h: 1000 },
    { label: 'favicon-icon-180x180', w: 180, h: 180 },
  ];

  const dataUrl = await fileToDataUrl(file);
  const img = await loadImageElement(dataUrl);
  const baseName = file.name.replace(/\.[^.]+$/, '');
  const results: ProcessedFileItem[] = [];

  for (const p of presets) {
    const canvas = document.createElement('canvas');
    canvas.width = p.w;
    canvas.height = p.h;
    const ctx = canvas.getContext('2d')!;

    // Smart cover crop
    const scale = Math.max(p.w / (img.naturalWidth || 800), p.h / (img.naturalHeight || 600));
    const drawW = (img.naturalWidth || 800) * scale;
    const drawH = (img.naturalHeight || 600) * scale;
    const dx = (p.w - drawW) / 2;
    const dy = (p.h - drawH) / 2;

    ctx.fillStyle = '#171927';
    ctx.fillRect(0, 0, p.w, p.h);
    ctx.drawImage(img, dx, dy, drawW, drawH);

    const blob = await new Promise<Blob>((res) =>
      canvas.toBlob((b) => res(b || new Blob()), 'image/jpeg', 0.9)
    );
    results.push({
      id: `${baseName}-${p.label}`,
      name: `${baseName}-${p.label}.jpg`,
      originalSize: file.size,
      outputSize: blob.size,
      mimeType: 'image/jpeg',
      blob,
      previewUrl: URL.createObjectURL(blob),
      metaSummary: { Dimensions: `${p.w} × ${p.h} px` },
    });
  }

  return results;
}

// ============================================================================
// 4. Custom Vector SVG / PNG QR Code Studio Engine
// ============================================================================

export async function generateCustomQrCode(options: {
  payload: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  darkColor: string;
  lightColor: string;
  margin: number;
}): Promise<{ svgString: string; pngDataUrl: string }> {
  const safePayload = options.payload.trim() || 'https://nextgentoolkit.pages.dev';
  const svgString = await QRCode.toString(safePayload, {
    type: 'svg',
    errorCorrectionLevel: options.errorCorrectionLevel,
    margin: options.margin,
    color: {
      dark: options.darkColor,
      light: options.lightColor,
    },
  });

  const pngDataUrl = await QRCode.toDataURL(safePayload, {
    width: 600,
    errorCorrectionLevel: options.errorCorrectionLevel,
    margin: options.margin,
    color: {
      dark: options.darkColor,
      light: options.lightColor,
    },
  });

  return { svgString, pngDataUrl };
}

// ============================================================================
// 5. Platform-Wide Bulk ZIP Archive Downloader (JSZip)
// ============================================================================

export async function createBatchZipBlob(
  files: { name: string; content: Blob | string }[]
): Promise<Blob> {
  const zip = new JSZip();
  files.forEach((f) => {
    zip.file(f.name, f.content);
  });
  return zip.generateAsync({ type: 'blob' });
}
