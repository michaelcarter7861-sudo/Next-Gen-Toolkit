import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';

const sourcePath = new URL('../public/og-cover.svg', import.meta.url);
const outputPath = new URL('../public/og-cover.png', import.meta.url);

const svg = await readFile(sourcePath);
const { data, info } = await sharp(svg, { density: 144 })
  .resize(1200, 630, { fit: 'fill' })
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toBuffer({ resolveWithObject: true });

if (info.width !== 1200 || info.height !== 630) {
  throw new Error(`Social preview must be 1200x630; received ${info.width}x${info.height}`);
}

await writeFile(outputPath, data);
console.log(`Generated public/og-cover.png (${info.width}x${info.height}, ${data.length} bytes)`);
