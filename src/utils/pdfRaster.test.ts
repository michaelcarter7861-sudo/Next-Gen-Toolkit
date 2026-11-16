import test from 'node:test';
import assert from 'node:assert/strict';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import {
  MAX_CANVAS_PIXELS,
  clampDpi,
  dpiToScale,
  parsePageSelection,
  renderPdfPages,
  type RasterAdapters,
} from './pdfRaster';
import { compressPdfToTargetKb } from './binaryEngines';

/**
 * Executes the shipped rasteriser against a real PDF engine (pdf.js) and a real
 * Skia canvas. This is engine-level verification, not a browser test: it proves
 * pages are genuinely rasterised, sized and encoded, but it does not verify
 * browser worker loading, memory pressure on phones or Safari quirks.
 */

type PdfJsModule = typeof import('pdfjs-dist/legacy/build/pdf.mjs');

const adapters = async (): Promise<RasterAdapters> => {
  const pdfjs = (await import('pdfjs-dist/legacy/build/pdf.mjs')) as unknown as PdfJsModule;
  return {
    loadPdf: async (bytes) => {
      const doc = await pdfjs.getDocument({ data: bytes, useSystemFonts: true }).promise;
      return {
        numPages: doc.numPages,
        getPage: async (pageNumber: number) => doc.getPage(pageNumber) as never,
        destroy: () => doc.destroy(),
      };
    },
    createCanvas: (width, height) => createCanvas(width, height) as never,
    encode: async (canvas, format, quality) => {
      const target = canvas as unknown as { toBuffer: (mime: string, quality?: number) => Buffer };
      const buffer =
        format === 'image/png'
          ? target.toBuffer('image/png')
          : target.toBuffer(
              format === 'image/webp' ? 'image/webp' : 'image/jpeg',
              Math.round(Math.min(1, Math.max(0, quality)) * 100)
            );
      return { bytes: new Uint8Array(buffer), mime: format };
    },
  };
};

async function makePdf(pageCount = 3): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pageCount; i++) {
    const page = doc.addPage([595, 842]);
    page.drawText(`Raster test page ${i + 1}`, { x: 48, y: 780, size: 28, font });
    for (let line = 0; line < 12; line++) {
      page.drawText(`Line ${line} of body text on page ${i + 1}`, {
        x: 48,
        y: 700 - line * 22,
        size: 13,
        font,
      });
    }
  }
  return new Uint8Array(await doc.save());
}

test('page selection parsing rejects anything it cannot interpret', () => {
  assert.deepEqual(parsePageSelection('all', 3), [0, 1, 2]);
  assert.deepEqual(parsePageSelection('', 3), [0, 1, 2]);
  assert.deepEqual(parsePageSelection('1-2, 3', 3), [0, 1, 2]);
  assert.deepEqual(parsePageSelection('2', 5), [1]);
  assert.throws(() => parsePageSelection('0', 3), /does not exist|valid page/i);
  assert.throws(() => parsePageSelection('9', 3), /does not exist/i);
  assert.throws(() => parsePageSelection('3-1', 3), /valid page range/i);
  assert.throws(() => parsePageSelection('abc', 3), /valid page selection/i);
  assert.throws(() => parsePageSelection('all', 0), /no pages/i);
});

test('DPI helpers clamp to a sane range', () => {
  assert.equal(clampDpi(150), 150);
  assert.equal(clampDpi(1000), 600);
  assert.equal(clampDpi(10), 72);
  assert.equal(clampDpi(undefined), 150);
  assert.equal(dpiToScale(72), 1);
  assert.equal(dpiToScale(144), 2);
});

test('real rasterisation: selected pages become genuine PNG images', async () => {
  const bytes = await makePdf(3);
  const result = await renderPdfPages(
    bytes,
    { pages: '1,3', dpi: 72, format: 'image/png', baseName: 'report.pdf' },
    await adapters()
  );

  assert.equal(result.pageCount, 3);
  assert.equal(result.pages.length, 2, 'only the selected pages are rendered');
  assert.deepEqual(result.pages.map((page) => page.pageNumber), [1, 3]);

  for (const page of result.pages) {
    // A4 at 72 DPI is 595 × 842 points.
    assert.ok(Math.abs(page.width - 595) <= 1, `unexpected width ${page.width}`);
    assert.ok(Math.abs(page.height - 842) <= 1, `unexpected height ${page.height}`);
    assert.equal(page.mime, 'image/png');
    assert.match(page.name, /^report-page-\d{2}\.png$/);
    // PNG magic bytes prove a real image was produced, not a placeholder string.
    assert.equal(
      Buffer.from(page.bytes.subarray(0, 4)).toString('hex'),
      '89504e47',
      'output is not a PNG'
    );
    // Decode and count ink: placeholder shapes would be uniform.
    const image = await loadImage(Buffer.from(page.bytes));
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image as never, 0, 0);
    const data = ctx.getImageData(0, 0, image.width, image.height).data;
    let darkPixels = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] < 160) darkPixels++;
    }
    assert.ok(darkPixels > 2000, `page ${page.pageNumber} rendered almost no text (${darkPixels} dark px)`);
  }
});

test('higher DPI really produces more pixels', async () => {
  const bytes = await makePdf(1);
  const result = await renderPdfPages(
    bytes,
    { pages: '1', dpi: 144, format: 'image/jpeg', quality: 0.8 },
    await adapters()
  );
  const [page] = result.pages;
  assert.ok(page.width > 1100, `expected ~1190 px wide, got ${page.width}`);
  assert.equal(page.mime, 'image/jpeg');
  assert.equal(Buffer.from(page.bytes.subarray(0, 2)).toString('hex'), 'ffd8', 'not a JPEG');
  assert.equal(page.dpi, 144);
});

test('the memory guard lowers DPI instead of attempting an impossible canvas', async () => {
  const bytes = await makePdf(1);
  const result = await renderPdfPages(
    bytes,
    { pages: '1', dpi: 600, format: 'image/png' },
    await adapters()
  );
  const [page] = result.pages;
  assert.equal(page.dpiReduced, true, '600 DPI on A4 must be capped');
  assert.ok(page.width * page.height <= MAX_CANVAS_PIXELS);
  assert.ok(page.dpi < 600);
});

test('the per-document pixel budget stops the run and says why', async () => {
  const bytes = await makePdf(6);
  // Two A4 pages at 72 DPI is ~1 MP; a 1.2 MP budget can therefore complete one.
  const result = await renderPdfPages(
    bytes,
    { pages: 'all', dpi: 72, format: 'image/png', maxPixels: 1_200_000 },
    await adapters()
  );
  assert.ok(result.pages.length >= 1 && result.pages.length < 6, `rendered ${result.pages.length}`);
  assert.equal(result.truncatedReason, 'pixel-budget');
  assert.equal(result.skipped, 6 - result.pages.length);
});

test('a page request outside the document fails loudly', async () => {
  const bytes = await makePdf(2);
  await assert.rejects(
    async () => renderPdfPages(bytes, { pages: '7', dpi: 72 }, await adapters()),
    /does not exist/i
  );
});

test('PDF compression distinguishes "already under the limit" from "no gain"', async () => {
  const bytes = await makePdf(3);
  const file = new File([new Uint8Array(bytes)], 'fixture.pdf', { type: 'application/pdf' });

  const generous = await compressPdfToTargetKb(file, 5000);
  assert.equal(generous.status, 'already-below-target');
  assert.equal(generous.targetMet, true);
  assert.equal(generous.savingsPercent, 0);
  assert.equal(generous.returnedOriginal, true);

  const aggressive = await compressPdfToTargetKb(file, 1);
  assert.notEqual(aggressive.status, 'met-target');
  assert.equal(aggressive.targetMet, false);
  assert.ok(['optimized-only', 'no-gain'].includes(aggressive.status));
  if (aggressive.status === 'no-gain') {
    assert.equal(aggressive.compressedSize, aggressive.originalSize);
    assert.equal(aggressive.returnedOriginal, true);
    assert.equal(aggressive.savingsPercent, 0);
  } else {
    assert.ok(aggressive.compressedSize < aggressive.originalSize);
    assert.ok(aggressive.savingsPercent > 0);
  }
});
