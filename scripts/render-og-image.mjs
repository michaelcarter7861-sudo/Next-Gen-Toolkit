import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';

execFileSync('npx', [
  '--yes',
  'sharp-cli@6.1.0',
  '--input',
  'public/og-cover.svg',
  '--output',
  'public/og-cover.png',
  'resize',
  '1200',
  '630',
], { stdio: 'inherit' });

const png = await readFile('public/og-cover.png');
const signature = png.subarray(0, 8).toString('hex');
const width = png.readUInt32BE(16);
const height = png.readUInt32BE(20);

if (signature !== '89504e470d0a1a0a' || width !== 1200 || height !== 630) {
  throw new Error(`Invalid social preview PNG: signature=${signature}, dimensions=${width}x${height}`);
}

console.log(`Generated validated social preview PNG: ${width}x${height} (${png.length} bytes)`);
