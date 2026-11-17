/**
 * Browser adapters for the PDF rasteriser.
 *
 * Loaded lazily by ToolWorkspace, so pdf.js and its worker stay out of the
 * initial bundle. The worker is bundled by Vite and served from the same origin
 * as the page, which keeps the "no upload" claim true: the PDF bytes never leave
 * the device.
 */
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  renderPdfPages,
  type PdfPageLike,
  type RasterAdapters,
  type RasterPageResult,
  type RasterOptions,
} from './pdfRaster';

let workerConfigured = false;

async function createAdapers(): Promise<RasterAdapters> {
  const pdfjs = await import('pdfjs-dist');
  if (!workerConfigured) {
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
    workerConfigured = true;
  }

  return {
    loadPdf: async (bytes) => {
      const task = pdfjs.getDocument({
        data: bytes,
        // Never fetch anything remote: fonts and images stay local.
        disableFontFace: false,
        useSystemFonts: true,
      });
      const doc = await task.promise;
      return {
        numPages: doc.numPages,
        getPage: async (pageNumber: number) =>
          (await doc.getPage(pageNumber)) as unknown as PdfPageLike,
        destroy: () => doc.destroy(),
      };
    },
    createCanvas: (width, height) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      return canvas;
    },
    encode: (canvas, format, quality) =>
      new Promise((resolve, reject) => {
        const target = canvas as HTMLCanvasElement;
        target.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('This browser could not encode the rendered page.'));
              return;
            }
            blob.arrayBuffer().then((buffer) => {
              resolve({ bytes: new Uint8Array(buffer), mime: blob.type || format });
            }, reject);
          },
          format,
          quality
        );
      }),
  };
}

export interface BrowserRasterResult {
  pages: RasterPageResult[];
  pageCount: number;
  skipped: number;
  truncatedReason: 'page-cap' | 'pixel-budget' | 'cancelled' | null;
}

export async function renderPdfPagesInBrowser(
  file: File,
  options: RasterOptions
): Promise<BrowserRasterResult> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const adapters = await createAdapers();
  return renderPdfPages(bytes, { ...options, baseName: options.baseName ?? file.name }, adapters);
}
