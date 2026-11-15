import test from 'node:test';
import assert from 'node:assert/strict';
import {
  processJsonInput,
  jsonToCsv,
  jsonToYaml,
  jsonToTypeScript,
  estimateBpeTokens,
  evaluateRegex,
  decodeJwtToken,
  computeTextDiff,
  encodeDecodeCodec,
  scrubAiWatermarksAndFormat,
  analyzeSeoWordDensity,
  convertTextCases,
  cleanDuplicateLines,
  generateCryptoSecret,
  convertEpochTimestamp,
  parseCronExpression,
  parsePageRanges,
  inspectImageBinaryMetadata,
} from './toolEngines';

test('JSON processor auto-fixes broken JSON and converts to CSV/YAML/TS', () => {
  const broken = "{ name: 'NextGenToolkit', tools: 25, active: true, }";
  const failed = processJsonInput(broken, 2, false);
  assert.equal(failed.valid, false);

  const repaired = processJsonInput(broken, 2, true);
  assert.equal(repaired.valid, true);
  assert.equal(repaired.repaired, true);

  const csv = jsonToCsv([repaired.parsedValue]);
  assert.match(csv, /name,tools,active/);
  assert.match(csv, /NextGenToolkit,25,true/);

  const yaml = jsonToYaml(repaired.parsedValue);
  assert.match(yaml, /name: NextGenToolkit/);

  const ts = jsonToTypeScript(repaired.parsedValue, 'PlatformConfig');
  assert.match(ts, /export interface PlatformConfig/);
});

test('LLM BPE token estimator computes counts and pricing matrix across 4 models', () => {
  const result = estimateBpeTokens('NextGenToolkit processes 100% of files inside browser RAM with zero server uploads.');
  assert.ok(result.tokens > 8);
  assert.equal(result.models.length, 4);
  assert.ok(result.models[0].estimatedTokens > 0);
});

test('Live Regex evaluator finds capture groups and explains AST tokens', () => {
  const res = evaluateRegex('(\\w+)@([a-z]+\\.[a-z]+)', 'gi', 'Contact dev@nextgentoolkit.tools or support@nextgentoolkit.io');
  assert.equal(res.valid, true);
  assert.equal(res.matches.length, 2);
  assert.equal(res.matches[0].groups[0], 'dev');
  assert.ok(res.tokens.length >= 2);
});

test('JWT decoder parses header, payload, and expiration status accurately', () => {
  // Header: {"alg":"HS256","typ":"JWT"}, Payload: {"sub":"1234567890","name":"NextGenToolkit Dev","iat":1516239022,"exp":1999999999}
  const sampleJwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik5leHRHZW5Ub29sa2l0IERldiIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxOTk5OTk5OTk5fQ.signature';
  const decoded = decodeJwtToken(sampleJwt, 1700000000000);
  assert.equal(decoded.valid, true);
  assert.equal(decoded.isExpired, false);
  assert.equal(decoded.payload?.name, 'NextGenToolkit Dev');
});

test('Myers text diff computes added/removed counts and Unified patch', () => {
  const diff = computeTextDiff('line 1\nline 2\n', 'line 1\nline 2 updated\nline 3\n');
  assert.ok(diff.addedCount >= 1);
  assert.ok(diff.removedCount >= 1);
  assert.match(diff.patchText, /@@/);
});

test('UTF-8 safe Base64 and URL codec handles Unicode symbols cleanly', () => {
  const encoded = encodeDecodeCodec('NextGenToolkit ✓ 100% Client-Side', 'base64-encode');
  const decoded = encodeDecodeCodec(encoded, 'base64-decode');
  assert.equal(decoded, 'NextGenToolkit ✓ 100% Client-Side');
});

test('AI watermark scrubber removes zero-width spaces and non-breaking spaces', () => {
  const dirty = 'Hello\u200BWorld\uFEFF\u00A0from\u200DChatGPT';
  const res = scrubAiWatermarksAndFormat(dirty);
  assert.equal(res.removedZeroWidthCount, 3);
  assert.equal(res.removedNbspCount, 1);
  assert.equal(res.cleanedText, 'HelloWorld fromChatGPT');
});

test('SEO Word Counter & N-Gram analyzer calculates SERP pixel width and density', () => {
  const sample = 'Compress PDF online free with NextGenToolkit offline PDF compressor. Compress PDF fast.';
  const stats = analyzeSeoWordDensity(sample);
  assert.equal(stats.words, 12);
  assert.ok(stats.titlePixelWidth > 100);
  assert.equal(stats.unigrams[0].phrase, 'pdf');
  assert.equal(stats.unigrams[0].count, 3);
});

test('Case Converter & Slug Maker generates 12 cases and strips stop words', () => {
  const cases = convertTextCases('How to Compress a PDF Under 200KB in Browser');
  assert.equal(cases['kebab-case'], 'how-to-compress-a-pdf-under-200kb-in-browser');
  assert.equal(cases['SEO URL Slug (Stop-Words Stripped)'], 'how-compress-pdf-under-200kb-browser');
});

test('Duplicate Line Cleaner deduplicates and sorts lines', () => {
  const res = cleanDuplicateLines('banana\napple\nbanana\ncherry\napple', { sortMode: 'asc' });
  assert.equal(res.uniqueCount, 3);
  assert.equal(res.removedDuplicates, 2);
  assert.equal(res.output, 'apple\nbanana\ncherry');
});

test('Crypto Secret Generator calculates bits of entropy and crack time', () => {
  const res = generateCryptoSecret({
    length: 24,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  assert.equal(res.password.length, 24);
  assert.ok(res.entropyBits > 120);
});

test('Epoch converter auto-detects 10-digit seconds vs 13-digit milliseconds', () => {
  const secRes = convertEpochTimestamp('1700000000');
  assert.equal(secRes.valid, true);
  assert.equal(secRes.detectedUnit, 'seconds (10-digit)');
  assert.equal(secRes.epochMilliseconds, 1700000000000);

  const msRes = convertEpochTimestamp('1700000000000');
  assert.equal(msRes.detectedUnit, 'milliseconds (13-digit)');
});

test('Cron AST parser translates 5-field expressions and finds next 10 executions', () => {
  const cron = parseCronExpression('*/15 * * * *', new Date('2026-11-13T00:00:00Z'));
  assert.equal(cron.valid, true);
  assert.equal(cron.nextExecutions.length, 10);
  assert.match(cron.humanReadable, /every 15 minutes/i);
});

test('PDF range parser parses 1-3, 5, 8-10 accurately into 0-indexed page indices', () => {
  const indices = parsePageRanges('1-3, 5, 8-10', 12);
  assert.deepEqual(indices, [0, 1, 2, 4, 7, 8, 9]);
});

test('Binary image inspector detects real JPEG APP1 EXIF segments and clean buffers', () => {
  // Construct minimal JPEG with APP1 Exif header + clean JPEG without APP1
  const exifBytes = new TextEncoder().encode('Exif\0\0Canon EOS R5');
  const segLen = 2 + exifBytes.length;
  const jpegWithExif = new Uint8Array(4 + segLen + 2);
  jpegWithExif.set([0xff, 0xd8, 0xff, 0xe1, (segLen >> 8) & 0xff, segLen & 0xff], 0);
  jpegWithExif.set(exifBytes, 6);
  jpegWithExif.set([0xff, 0xd9], 4 + segLen);

  const reportDirty = inspectImageBinaryMetadata(jpegWithExif);
  assert.equal(reportDirty.container, 'JPEG');
  assert.equal(reportDirty.hasExif, true);
  assert.ok(reportDirty.detectedSegments.length >= 1);

  const cleanJpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
  const reportClean = inspectImageBinaryMetadata(cleanJpeg);
  assert.equal(reportClean.container, 'JPEG');
  assert.equal(reportClean.hasExif, false);
  assert.equal(reportClean.detectedSegments.length, 0);
});
