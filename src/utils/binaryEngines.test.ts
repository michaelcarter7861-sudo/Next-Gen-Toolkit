import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import {
  buildCompressedImageName,
  compressPdfToTargetKb,
  extensionForImageMime,
} from './binaryEngines';

/**
 * These tests exist because the previous build shipped binary tools that
 * reported savings that had not happened and produced outputs that were not
 * real conversions. The assertions below encode the honesty contract.
 */

async function makeTextPdf(pageCount = 6): Promise<File> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let p = 0; p < pageCount; p++) {
    const page = doc.addPage([595, 842]);
    for (let i = 0; i < 30; i++) {
      page.drawText(`Verification line ${i} on page ${p + 1} 0123456789`, {
        x: 40,
        y: 800 - i * 20,
        size: 10,
        font,
      });
    }
  }
  const bytes = await doc.save({ useObjectStreams: true });
  return new File([new Uint8Array(bytes)], 'fixture.pdf', { type: 'application/pdf' });
}

test('PDF optimisation never returns a file larger than the input', async () => {
  const file = await makeTextPdf();
  for (const target of [50, 100, 200]) {
    const result = await compressPdfToTargetKb(file, target);
    assert.ok(
      result.compressedSize <= result.originalSize,
      `target ${target}KB produced a larger file (${result.compressedSize} > ${result.originalSize})`
    );
    if (result.returnedOriginal) {
      assert.equal(result.savingsPercent, 0, 'Returning the original must report 0% savings');
      assert.equal(result.compressedSize, result.originalSize);
    }
  }
});

test('PDF optimisation never claims a target it did not reach', async () => {
  const file = await makeTextPdf(10);
  // 1 KB is unreachable for a real PDF, so targetMet must be false and the
  // status must say so rather than defaulting to a fabricated success.
  const result = await compressPdfToTargetKb(file, 1);
  assert.equal(result.targetMet, false);
  assert.notEqual(result.status, 'met-target');
  assert.ok(result.compressedSize > 1024);
});

test('PDF optimisation reports the measured byte change, not a floored number', async () => {
  const file = await makeTextPdf();
  const result = await compressPdfToTargetKb(file, 500);
  const realPercent = Math.round(
    ((result.originalSize - result.compressedSize) / result.originalSize) * 100
  );
  assert.equal(result.savingsPercent, realPercent);
  assert.ok(result.savingsPercent >= 0, 'Savings must never be negative');
});

test('PDF optimisation survives a corrupt input with a clear error', async () => {
  const broken = new File([new TextEncoder().encode('not a pdf at all')], 'broken.pdf', {
    type: 'application/pdf',
  });
  await assert.rejects(() => compressPdfToTargetKb(broken, 100), /could not be parsed|encrypted|corrupted/i);
});

test('Image output filenames follow the format the user selected', () => {
  assert.equal(buildCompressedImageName('photo.JPG', 50, 'image/webp'), 'photo-50kb.webp');
  assert.equal(buildCompressedImageName('passport.png', 20, 'image/png'), 'passport-20kb.png');
  assert.equal(buildCompressedImageName('scan.jpeg', 100, 'image/jpeg'), 'scan-100kb.jpg');
  assert.equal(extensionForImageMime('image/webp'), 'webp');
  assert.equal(extensionForImageMime('image/png'), 'png');
  assert.equal(extensionForImageMime('image/jpeg'), 'jpg');
  // A file with no extension must still produce a valid name.
  assert.equal(buildCompressedImageName('no-extension', 20, 'image/jpeg'), 'no-extension-20kb.jpg');
});

test('Regression guard: simulated output must not return to the source tree', () => {
  const forbidden = [
    'Simulated document lines',
    'OCR VERIFICATION LINE',
    'Math.max(4,',
  ];
  const root = path.resolve('src');
  const offenders: string[] = [];

  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.(ts|tsx)$/.test(entry) || entry.endsWith('.test.ts')) continue;
      const content = readFileSync(full, 'utf8');
      for (const needle of forbidden) {
        if (content.includes(needle)) offenders.push(`${full} contains "${needle}"`);
      }
    }
  };

  walk(root);
  assert.deepEqual(offenders, [], `Fabricated output or floored metrics detected:\n${offenders.join('\n')}`);
});
