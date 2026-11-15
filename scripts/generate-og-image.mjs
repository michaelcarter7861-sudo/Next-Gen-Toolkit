import sharp from 'sharp';
import { readFile } from 'node:fs/promises';

const source = await readFile('public/og-cover.svg');
await sharp(source, { density: 96 })
  .resize(1200, 630, { fit: 'fill' })
  .png({ compressionLevel: 9 })
  .toFile('public/og-cover.png');

console.log('Generated public/og-cover.png (1200x630).');
