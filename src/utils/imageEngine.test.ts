import test from 'node:test';
import assert from 'node:assert/strict';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { compressImageToExactKbClient, resolveEncodedFormat } from './binaryEngines';

/**
 * These tests execute the *shipped* image engine, not a reimplementation.
 *
 * The browser globals it depends on (canvas, Image, FileReader, object URLs) are
 * shimmed onto a real Skia-backed canvas implementation, so encoders, byte
 * ceilings and format detection are exercised for real. This is NOT a browser
 * test: layout, Blob.type quirks of individual browsers and Safari/WebKit
 * behaviour still require a real browser run (see audit/DESIGN-IMPLEMENTATION-AND-QA.md).
 */

type AnyRecord = Record<string, unknown>;

class ShimImage {
  onload: (() => void) | null = null;
  onerror: ((error: unknown) => void) | null = null;
  naturalWidth = 0;
  naturalHeight = 0;
  width = 0;
  height = 0;
  private inner: Awaited<ReturnType<typeof loadImage>> | null = null;

  set src(value: string) {
    const base64 = value.split(',')[1] ?? '';
    const buffer = Buffer.from(base64, 'base64');
    loadImage(buffer).then((image) => {
      this.inner = image;
      this.naturalWidth = image.width;
      this.naturalHeight = image.height;
      this.width = image.width;
      this.height = image.height;
      this.onload?.();
    }, (error) => this.onerror?.(error));
  }

  get image() {
    return this.inner;
  }
}

class ShimFileReader {
  result: string | null = null;
  onload: (() => void) | null = null;
  onerror: ((error: unknown) => void) | null = null;
  readAsDataURL(file: File) {
    file.arrayBuffer().then((buffer) => {
      this.result = `data:${file.type};base64,${Buffer.from(buffer).toString('base64')}`;
      this.onload?.();
    }, (error) => this.onerror?.(error));
  }
}

function installShims() {
  const g = globalThis as unknown as AnyRecord;
  g.document = {
    createElement: (tag: string) => {
      if (tag !== 'canvas') throw new Error(`Unsupported element: ${tag}`);
      const canvas = createCanvas(1, 1);
      const originalGetContext = canvas.getContext.bind(canvas);
      (canvas as unknown as AnyRecord).getContext = (type: '2d') => {
        const ctx = originalGetContext(type) as unknown as AnyRecord & {
          drawImage: (image: unknown, ...rest: number[]) => void;
        };
        if (!(ctx as AnyRecord).__patched) {
          const originalDraw = ctx.drawImage.bind(ctx);
          ctx.drawImage = (image: unknown, ...rest: number[]) => {
            const unwrapped = (image as { image?: unknown })?.image ?? image;
            originalDraw(unwrapped, ...rest);
          };
          (ctx as AnyRecord).__patched = true;
        }
        return ctx;
      };
      // napi-rs canvases already expose width/height/getContext/drawImage and
      // toBlob-compatible encoding through toBuffer; adapt the Blob call.
      (canvas as unknown as AnyRecord).toBlob = (
        callback: (blob: Blob | null) => void,
        type: string,
        quality: number
      ) => {
        const mime = type === 'image/webp' ? 'image/webp' : type === 'image/png' ? 'image/png' : 'image/jpeg';
        // IMPORTANT: the browser API takes quality 0..1, @napi-rs/canvas takes
        // 0..100. Passing 0.92 straight through silently encodes at ~1% quality,
        // which would make every ceiling look trivially reachable. The harness
        // must convert, exactly as the real canvas implementation does.
        const buffer =
          mime === 'image/png'
            ? canvas.toBuffer('image/png')
            : canvas.toBuffer(
                mime as 'image/jpeg' | 'image/webp',
                Math.round(Math.min(1, Math.max(0, quality)) * 100)
              );
        callback(new Blob([new Uint8Array(buffer)], { type: mime }));
      };
      return canvas;
    },
  };
  g.Image = ShimImage;
  g.FileReader = ShimFileReader;
  if (typeof g.URL === 'function' || typeof g.URL === 'object') {
    (g.URL as AnyRecord).createObjectURL = () => 'blob:shim';
    (g.URL as AnyRecord).revokeObjectURL = () => undefined;
  }
}

installShims();

async function makePhotoFile(
  width: number,
  height: number,
  mime: 'image/jpeg' | 'image/png' = 'image/jpeg',
  colour = '#4F46E5'
): Promise<File> {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = colour;
  ctx.fillRect(0, 0, width, height);
  // Deterministic pseudo-noise so the encoder has real high-frequency work:
  // a flat colour block would compress to a few KB and prove nothing.
  const imageData = ctx.getImageData(0, 0, width, height);
  let seed = 123456789;
  for (let i = 0; i < imageData.data.length; i += 4) {
    // Gradient base + per-pixel noise: roughly the entropy of a real photograph,
    // so the encoders and the byte search are exercised honestly.
    const pixel = i / 4;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const noise = (seed & 0x3f) - 32;
    imageData.data[i] = (Math.round((x / width) * 200) + noise + 28) & 0xff;
    imageData.data[i + 1] = (Math.round((y / height) * 200) + noise + 28) & 0xff;
    imageData.data[i + 2] = (160 + noise) & 0xff;
  }
  ctx.putImageData(imageData, 0, 0);
  const buffer =
    mime === 'image/png' ? canvas.toBuffer('image/png') : canvas.toBuffer('image/jpeg', 95);
  return new File([new Uint8Array(buffer)], `fixture.${mime === 'image/png' ? 'png' : 'jpg'}`, {
    type: mime,
  });
}

test('format resolution trusts the encoder, not the request', () => {
  assert.deepEqual(resolveEncodedFormat('image/webp', 'image/png'), {
    mime: 'image/png',
    fallback: true,
  });
  assert.deepEqual(resolveEncodedFormat('image/webp', 'image/webp'), {
    mime: 'image/webp',
    fallback: false,
  });
  assert.deepEqual(resolveEncodedFormat('image/jpeg', ''), { mime: 'image/jpeg', fallback: false });
  assert.deepEqual(resolveEncodedFormat('image/jpeg', 'image/jpg'), {
    mime: 'image/jpeg',
    fallback: false,
  });
});

test('JPEG to JPEG meets an exact ceiling and names the file .jpg', async () => {
  const file = await makePhotoFile(1600, 1200, 'image/jpeg');
  assert.ok(file.size > 20 * 1024, 'fixture should start above the ceiling');
  const result = await compressImageToExactKbClient(file, 20, 'image/jpeg');
  assert.equal(result.status, 'met-target');
  assert.ok(result.outputSize <= 20 * 1024, `output ${result.outputSize} exceeded 20 KB`);
  assert.equal(result.actualMime, 'image/jpeg');
  assert.match(result.name, /-20kb\.jpg$/);
  assert.ok(result.savingsPercent > 0);
});

test('JPEG to WebP output keeps a truthful extension when the encoder disagrees', async () => {
  const file = await makePhotoFile(1200, 900, 'image/jpeg');
  const result = await compressImageToExactKbClient(file, 50, 'image/webp');
  const ext = result.name.split('.').pop();
  assert.equal(ext, result.actualMime === 'image/webp' ? 'webp' : result.actualMime === 'image/png' ? 'png' : 'jpg');
  assert.equal(result.targetMet, result.outputSize <= 50 * 1024);
});

test('PNG stays lossless and reports whether resolution was traded away', async () => {
  const file = await makePhotoFile(800, 600, 'image/png');
  assert.ok(file.size > 40 * 1024, `fixture too small to be meaningful (${file.size} bytes)`);
  const result = await compressImageToExactKbClient(file, 40, 'image/png');
  assert.equal(result.actualMime, 'image/png');
  assert.equal(result.achievedQuality, null, 'PNG must not report a lossy quality value');
  assert.equal(result.status === 'met-target', result.outputSize <= 40 * 1024);
  assert.equal(result.targetMet, result.outputSize <= 40 * 1024);
  // Whatever happened, the result states it: either native dimensions or a
  // scaled size, never an unexplained silent reduction.
  assert.match(result.finalDimensions, /px$/);
  if (result.scaled) {
    assert.notEqual(result.finalDimensions, result.originalDimensions);
  }
  // PNG is lossless, so a very small ceiling may be unreachable even after
  // scaling. If so the engine must say "best effort", never "target met".
  if (!result.targetMet) {
    assert.equal(result.status, 'best-effort');
  }
});

test('an image already inside the ceiling is returned untouched', async () => {
  const file = await makePhotoFile(160, 120, 'image/jpeg');
  const result = await compressImageToExactKbClient(file, 500, 'image/jpeg');
  assert.equal(result.status, 'already-below-target');
  assert.equal(result.outputSize, file.size);
  assert.equal(result.savingsPercent, 0);
  assert.equal(result.scaled, false);
  assert.equal(result.name, file.name, 'an untouched file keeps its original name');
});

test('an impossible ceiling is reported as best effort, never as success', async () => {
  const file = await makePhotoFile(2400, 1800, 'image/jpeg');
  const result = await compressImageToExactKbClient(file, 1, 'image/jpeg');
  assert.notEqual(result.status, 'met-target');
  assert.equal(result.targetMet, false);
  assert.equal(result.status, 'best-effort');
  assert.ok(result.outputSize > 1024, 'a 1 KB ceiling cannot honestly be met');
  // Resolution was traded away, and the result says so.
  assert.equal(result.scaled, true);
  assert.notEqual(result.finalDimensions, result.originalDimensions);
});

test('an already-small file keeps its own format even if another was requested', async () => {
  // A 30 KB PNG asked to become a 50 KB JPEG needs no work at all. Re-encoding
  // would lose quality and change the format for no benefit, so the engine must
  // hand back the untouched PNG and say that it did.
  const file = await makePhotoFile(320, 320, 'image/png');
  const result = await compressImageToExactKbClient(file, 500, 'image/jpeg');
  assert.equal(result.status, 'already-below-target');
  assert.equal(result.actualMime, 'image/png');
  assert.equal(result.formatFallback, true, 'the requested format was not applied, and that is reported');
  assert.equal(result.outputSize, file.size);
  assert.equal(result.name, file.name);
});

test('transparency handling is stated in the result', async () => {
  const file = await makePhotoFile(400, 400, 'image/png');
  const asJpeg = await compressImageToExactKbClient(file, 20, 'image/jpeg');
  assert.equal(asJpeg.actualMime, 'image/jpeg');
  assert.match(String(asJpeg.transparencyNote), /white/i);

  const asPng = await compressImageToExactKbClient(file, 150, 'image/png');
  assert.equal(asPng.transparencyNote, null, 'PNG must not claim to flatten transparency');
});
