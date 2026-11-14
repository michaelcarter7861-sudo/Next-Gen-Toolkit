/**
 * @license
 * SPDX-License-Identifier: MIT
 *
 * NextGenToolkit Pure Client-Side Execution Engines
 * Refactored from permissive MIT/ISC/BSD open-source algorithms (IT-Tools, Omni-Tools,
 * jsonrepair, jsdiff, Turndown) with zero UI framework coupling.
 */

import { jsonrepair } from 'jsonrepair';
import * as Diff from 'diff';

// ============================================================================
// 1. JSON Formatter, Validator, Auto-Fixer & Multi-Format Converter
// ============================================================================

export interface JsonProcessResult {
  valid: boolean;
  repaired: boolean;
  formatted: string;
  minified: string;
  errorLine?: number;
  errorColumn?: number;
  errorMessage?: string;
  parsedValue?: unknown;
}

export function processJsonInput(raw: string, indent = 2, autoFix = false): JsonProcessResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {
      valid: false,
      repaired: false,
      formatted: '',
      minified: '',
      errorMessage: 'Input is empty.',
    };
  }

  try {
    const parsed = JSON.parse(trimmed);
    return {
      valid: true,
      repaired: false,
      formatted: JSON.stringify(parsed, null, indent),
      minified: JSON.stringify(parsed),
      parsedValue: parsed,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid JSON syntax';
    const posMatch = msg.match(/position\s+(\d+)/i);
    let errorLine = 1;
    let errorColumn = 1;
    if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      const upToPos = trimmed.slice(0, pos);
      const lines = upToPos.split('\n');
      errorLine = lines.length;
      errorColumn = (lines[lines.length - 1]?.length ?? 0) + 1;
    }

    if (autoFix) {
      try {
        const fixedStr = jsonrepair(trimmed);
        const parsed = JSON.parse(fixedStr);
        return {
          valid: true,
          repaired: true,
          formatted: JSON.stringify(parsed, null, indent),
          minified: JSON.stringify(parsed),
          parsedValue: parsed,
        };
      } catch {
        // Fall through to error return
      }
    }

    return {
      valid: false,
      repaired: false,
      formatted: raw,
      minified: '',
      errorLine,
      errorColumn,
      errorMessage: msg,
    };
  }
}

export function jsonToCsv(data: unknown): string {
  const rows: Record<string, unknown>[] = Array.isArray(data)
    ? data.map((item) => (typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : { value: item }))
    : typeof data === 'object' && data !== null
      ? [data as Record<string, unknown>]
      : [{ value: data }];

  if (rows.length === 0) return '';
  const headers = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((k) => set.add(k));
      return set;
    }, new Set<string>())
  );

  const escapeCsv = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => headers.map((h) => escapeCsv(row[h])).join(',')),
  ];
  return lines.join('\n');
}

export function jsonToYaml(data: unknown, depth = 0): string {
  const pad = '  '.repeat(depth);
  if (data === null || data === undefined) return 'null';
  if (typeof data === 'boolean' || typeof data === 'number') return String(data);
  if (typeof data === 'string') {
    if (/[:#\n"']/.test(data) || data.trim() !== data) {
      return JSON.stringify(data);
    }
    return data;
  }
  if (Array.isArray(data)) {
    if (data.length === 0) return '[]';
    return data
      .map((item) => {
        if (typeof item === 'object' && item !== null) {
          const nested = jsonToYaml(item, depth + 1).trimStart();
          return `${pad}- ${nested}`;
        }
        return `${pad}- ${jsonToYaml(item, depth + 1)}`;
      })
      .join('\n');
  }
  if (typeof data === 'object') {
    const entries = Object.entries(data as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    return entries
      .map(([k, v]) => {
        if (typeof v === 'object' && v !== null && (Array.isArray(v) ? v.length > 0 : Object.keys(v).length > 0)) {
          return `${pad}${k}:\n${jsonToYaml(v, depth + 1)}`;
        }
        return `${pad}${k}: ${jsonToYaml(v, depth + 1)}`;
      })
      .join('\n');
  }
  return String(data);
}

export function jsonToTypeScript(data: unknown, rootName = 'RootObject'): string {
  const inferType = (val: unknown, indent = 2): string => {
    if (val === null) return 'null';
    if (val === undefined) return 'undefined';
    if (Array.isArray(val)) {
      if (val.length === 0) return 'unknown[]';
      const itemType = inferType(val[0], indent);
      return `${itemType}[]`;
    }
    if (typeof val === 'object') {
      const entries = Object.entries(val as Record<string, unknown>);
      if (entries.length === 0) return 'Record<string, unknown>';
      const pad = ' '.repeat(indent);
      const closePad = ' '.repeat(Math.max(0, indent - 2));
      const fields = entries
        .map(([k, v]) => {
          const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
          return `${pad}${safeKey}: ${inferType(v, indent + 2)};`;
        })
        .join('\n');
      return `{\n${fields}\n${closePad}}`;
    }
    return typeof val;
  };

  const target = Array.isArray(data) && data.length > 0 ? data[0] : data;
  const body = inferType(target, 2);
  if (body.startsWith('{')) {
    return `export interface ${rootName} ${body}`;
  }
  return `export type ${rootName} = ${body};`;
}

export function jsonToSql(data: unknown, tableName = 'nextgentoolkit_records'): string {
  const rows: Record<string, unknown>[] = Array.isArray(data)
    ? data.filter((r): r is Record<string, unknown> => typeof r === 'object' && r !== null)
    : typeof data === 'object' && data !== null
      ? [data as Record<string, unknown>]
      : [];

  if (rows.length === 0) return `-- No tabular object records found for SQL generation`;
  const columns = Array.from(
    rows.reduce((set, r) => {
      Object.keys(r).forEach((k) => set.add(k));
      return set;
    }, new Set<string>())
  );

  const formatSqlVal = (val: unknown): string => {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return String(val);
    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
    const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    return `'${str.replace(/'/g, "''")}'`;
  };

  const createTable = `CREATE TABLE ${tableName} (\n${columns.map((c) => `  "${c}" TEXT`).join(',\n')}\n);\n`;
  const inserts = rows
    .map(
      (r) =>
        `INSERT INTO ${tableName} (${columns.map((c) => `"${c}"`).join(', ')}) VALUES (${columns
          .map((c) => formatSqlVal(r[c]))
          .join(', ')});`
    )
    .join('\n');

  return `${createTable}\n${inserts}`;
}

// ============================================================================
// 2. LLM Token Counter, Multi-Model Cost Matrix & Context Packer
// ============================================================================

export interface ModelTokenPricing {
  id: string;
  name: string;
  provider: string;
  vocab: string;
  contextWindow: number;
  inputCostPer1M: number;
  outputCostPer1M: number;
  estimatedTokens: number;
  inputCostUsd: number;
  outputCostUsd: number;
  contextPercent: number;
}

export function estimateBpeTokens(text: string): {
  tokens: number;
  words: number;
  chars: number;
  lines: number;
  models: ModelTokenPricing[];
} {
  if (!text) {
    return { tokens: 0, words: 0, chars: 0, lines: 0, models: [] };
  }
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text.split(/\r?\n/).length;

  // Accurate sub-word BPE heuristic accounting for punctuation, code symbols, and camelCase splits
  const tokenMatches = text.match(
    /[A-Z]?[a-z]+|[A-Z]+(?=[A-Z][a-z]|\b)|\d{1,3}|[^\s\w]|[\r\n]+/g
  );
  const baseTokens = Math.max(1, Math.round((tokenMatches ? tokenMatches.length : chars / 4) * 1.06));

  const specs = [
    {
      id: 'gemini-4-hydrogen',
      name: 'Gemini 2.5 Flash / 4 Hydrogen',
      provider: 'Google',
      vocab: 'SentencePiece 256k',
      factor: 0.96,
      contextWindow: 1000000,
      inputCostPer1M: 0.15,
      outputCostPer1M: 0.6,
    },
    {
      id: 'gemini-4-carbon',
      name: 'Gemini 2.5 Pro / 4 Carbon (Thinking)',
      provider: 'Google',
      vocab: 'SentencePiece 256k',
      factor: 0.98,
      contextWindow: 2000000,
      inputCostPer1M: 1.25,
      outputCostPer1M: 5.0,
    },
    {
      id: 'gpt-4o',
      name: 'GPT-4o (o200k_base)',
      provider: 'OpenAI',
      vocab: 'o200k_base',
      factor: 1.0,
      contextWindow: 128000,
      inputCostPer1M: 2.5,
      outputCostPer1M: 10.0,
    },
    {
      id: 'claude-3-7-sonnet',
      name: 'Claude 3.7 Sonnet (cl100k)',
      provider: 'Anthropic',
      vocab: 'cl100k_base',
      factor: 1.05,
      contextWindow: 200000,
      inputCostPer1M: 3.0,
      outputCostPer1M: 15.0,
    },
  ];

  const models: ModelTokenPricing[] = specs.map((s) => {
    const estimatedTokens = Math.max(1, Math.round(baseTokens * s.factor));
    const inputCostUsd = (estimatedTokens / 1_000_000) * s.inputCostPer1M;
    const outputCostUsd = (estimatedTokens / 1_000_000) * s.outputCostPer1M;
    const contextPercent = Math.min(100, (estimatedTokens / s.contextWindow) * 100);
    return {
      id: s.id,
      name: s.name,
      provider: s.provider,
      vocab: s.vocab,
      contextWindow: s.contextWindow,
      inputCostPer1M: s.inputCostPer1M,
      outputCostPer1M: s.outputCostPer1M,
      estimatedTokens,
      inputCostUsd,
      outputCostUsd,
      contextPercent,
    };
  });

  return { tokens: baseTokens, words, chars, lines, models };
}

export function packFilesForLlm(
  files: { name: string; content: string }[],
  format: 'xml' | 'markdown' = 'xml',
  stripComments = false
): string {
  const cleanContent = (code: string) => {
    let out = code;
    if (stripComments) {
      out = out.replace(/\/\*[\s\S]*?\*\/|^\s*\/\/.*$/gm, '');
      out = out.replace(/^\s*[\r\n]/gm, '');
    }
    return out.trim();
  };

  const treeLines = ['Directory Structure:', ...files.map((f) => `  ├── ${f.name}`)].join('\n');

  if (format === 'xml') {
    const fileBlocks = files
      .map((f) => `<file path="${f.name}">\n${cleanContent(f.content)}\n</file>`)
      .join('\n\n');
    return `<repository_context>\n<directory_tree>\n${treeLines}\n</directory_tree>\n\n${fileBlocks}\n</repository_context>`;
  }

  const mdBlocks = files
    .map((f) => `### File: \`${f.name}\`\n\`\`\`\n${cleanContent(f.content)}\n\`\`\``)
    .join('\n\n');
  return `# Repository Context\n\n\`\`\`text\n${treeLines}\n\`\`\`\n\n${mdBlocks}`;
}

// ============================================================================
// 3. Live Regex Tester & Token AST Explainer
// ============================================================================

export interface RegexMatchItem {
  index: number;
  match: string;
  groups: string[];
}

export interface RegexExplanationToken {
  token: string;
  meaning: string;
}

export function evaluateRegex(
  pattern: string,
  flags: string,
  testString: string
): {
  valid: boolean;
  error?: string;
  matches: RegexMatchItem[];
  tokens: RegexExplanationToken[];
} {
  const tokens = explainRegexTokens(pattern);
  if (!pattern) {
    return { valid: true, matches: [], tokens };
  }
  try {
    const safeFlags = flags.includes('g') ? flags : `${flags}g`;
    const regex = new RegExp(pattern, safeFlags);
    const matches: RegexMatchItem[] = [];
    let m: RegExpExecArray | null;
    let safety = 0;
    while ((m = regex.exec(testString)) !== null && safety < 500) {
      safety++;
      matches.push({
        index: m.index,
        match: m[0],
        groups: m.slice(1),
      });
      if (m[0].length === 0) regex.lastIndex++;
    }
    return { valid: true, matches, tokens };
  } catch (err: unknown) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : 'Invalid regular expression',
      matches: [],
      tokens,
    };
  }
}

export function explainRegexTokens(pattern: string): RegexExplanationToken[] {
  const rules: { re: RegExp; desc: (m: string) => string }[] = [
    { re: /^\^/, desc: () => 'Asserts position at the start of a line/string' },
    { re: /^\$/, desc: () => 'Asserts position at the end of a line/string' },
    { re: /^\\d/, desc: () => 'Matches any digit character (0–9)' },
    { re: /^\\D/, desc: () => 'Matches any non-digit character' },
    { re: /^\\w/, desc: () => 'Matches any word character (alphanumeric & underscore)' },
    { re: /^\\W/, desc: () => 'Matches any non-word character' },
    { re: /^\\s/, desc: () => 'Matches any whitespace character (spaces, tabs, line breaks)' },
    { re: /^\\S/, desc: () => 'Matches any non-whitespace character' },
    { re: /^\\b/, desc: () => 'Asserts a word boundary position' },
    { re: /^\[\^([^\]]+)\]/, desc: (m) => `Negated character class: matches anything NOT in ${m}` },
    { re: /^\[([^\]]+)\]/, desc: (m) => `Character class: matches any character inside ${m}` },
    { re: /^\(\?:([^)]+)\)/, desc: (m) => `Non-capturing group: ${m}` },
    { re: /^\(([^)]+)\)/, desc: (m) => `Capturing group: extracts sub-match for ${m}` },
    { re: /^\{\d+(?:,\d*)?\}/, desc: (m) => `Quantifier: repeats the preceding token ${m} times` },
    { re: /^\+/, desc: () => 'Quantifier: matches 1 or more of the preceding token' },
    { re: /^\*/, desc: () => 'Quantifier: matches 0 or more of the preceding token' },
    { re: /^\?/, desc: () => 'Quantifier: matches 0 or 1 of the preceding token (optional)' },
    { re: /^\./, desc: () => 'Wildcard: matches any single character except newline' },
    { re: /^\|/, desc: () => 'Alternation: matches either the expression before or after' },
    { re: /^\\./, desc: (m) => `Escaped literal character "${m.slice(1)}"` },
  ];

  const out: RegexExplanationToken[] = [];
  let remaining = pattern;
  while (remaining.length > 0) {
    let matched = false;
    for (const r of rules) {
      const m = remaining.match(r.re);
      if (m) {
        out.push({ token: m[0], meaning: r.desc(m[0]) });
        remaining = remaining.slice(m[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      const literalMatch = remaining.match(/^[^^$\\.*+?()[\]{}|]+/);
      const chunk = literalMatch ? literalMatch[0] : remaining[0];
      out.push({ token: chunk, meaning: `Matches literal character sequence "${chunk}"` });
      remaining = remaining.slice(chunk.length);
    }
  }
  return out;
}

// ============================================================================
// 4. JWT Decoder & Inspector
// ============================================================================

export interface JwtDecodeResult {
  valid: boolean;
  header?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  signature?: string;
  isExpired?: boolean;
  expiresAtIso?: string;
  issuedAtIso?: string;
  notBeforeIso?: string;
  timeRemainingText?: string;
  error?: string;
}

function decodeBase64Url(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(padded, 'base64').toString('utf-8');
  }
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function decodeJwtToken(token: string, nowMs = Date.now()): JwtDecodeResult {
  const clean = token.trim().replace(/^Bearer\s+/i, '');
  const parts = clean.split('.');
  if (parts.length !== 3) {
    return { valid: false, error: 'JWT must contain 3 dot-separated segments (Header.Payload.Signature).' };
  }
  try {
    const header = JSON.parse(decodeBase64Url(parts[0])) as Record<string, unknown>;
    const payload = JSON.parse(decodeBase64Url(parts[1])) as Record<string, unknown>;
    const signature = parts[2];

    let isExpired = false;
    let expiresAtIso: string | undefined;
    let issuedAtIso: string | undefined;
    let notBeforeIso: string | undefined;
    let timeRemainingText = 'No expiration claim (exp) present';

    if (typeof payload.exp === 'number') {
      const expMs = payload.exp * 1000;
      expiresAtIso = new Date(expMs).toISOString();
      const diffSec = Math.round((expMs - nowMs) / 1000);
      if (diffSec < 0) {
        isExpired = true;
        const agoMin = Math.round(Math.abs(diffSec) / 60);
        timeRemainingText = `Expired ${agoMin > 60 ? `${Math.round(agoMin / 60)}h` : `${agoMin}m`} ago`;
      } else {
        const hrs = Math.floor(diffSec / 3600);
        const mins = Math.floor((diffSec % 3600) / 60);
        timeRemainingText = `Valid (${hrs}h ${mins}m remaining)`;
      }
    }
    if (typeof payload.iat === 'number') {
      issuedAtIso = new Date(payload.iat * 1000).toISOString();
    }
    if (typeof payload.nbf === 'number') {
      notBeforeIso = new Date(payload.nbf * 1000).toISOString();
    }

    return {
      valid: true,
      header,
      payload,
      signature,
      isExpired,
      expiresAtIso,
      issuedAtIso,
      notBeforeIso,
      timeRemainingText,
    };
  } catch (err: unknown) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : 'Failed to decode Base64Url JSON payload.',
    };
  }
}

// ============================================================================
// 5. Code & Text Diff Checker (Myers Diff Algorithm)
// ============================================================================

export interface DiffResultSummary {
  changes: Diff.Change[];
  addedCount: number;
  removedCount: number;
  patchText: string;
}

export function computeTextDiff(
  originalText: string,
  modifiedText: string,
  options: { ignoreWhitespace?: boolean; ignoreCase?: boolean } = {}
): DiffResultSummary {
  const a = options.ignoreCase ? originalText.toLowerCase() : originalText;
  const b = options.ignoreCase ? modifiedText.toLowerCase() : modifiedText;
  const changes = Diff.diffLines(a, b, {
    ignoreWhitespace: Boolean(options.ignoreWhitespace),
  });

  let addedCount = 0;
  let removedCount = 0;
  for (const part of changes) {
    const lineCount = part.count ?? part.value.split('\n').filter(Boolean).length;
    if (part.added) addedCount += lineCount;
    if (part.removed) removedCount += lineCount;
  }

  const patchText = Diff.createPatch('document.txt', originalText, modifiedText, 'Original', 'Modified');
  return { changes, addedCount, removedCount, patchText };
}

// ============================================================================
// 6. Base64, URL & HTML Entity Codec (UTF-8 Safe)
// ============================================================================

export function encodeDecodeCodec(
  input: string,
  mode: 'base64-encode' | 'base64-decode' | 'url-encode' | 'url-decode' | 'html-encode' | 'html-decode'
): string {
  try {
    switch (mode) {
      case 'base64-encode': {
        const bytes = new TextEncoder().encode(input);
        let binary = '';
        bytes.forEach((b) => (binary += String.fromCharCode(b)));
        return typeof Buffer !== 'undefined'
          ? Buffer.from(input, 'utf-8').toString('base64')
          : btoa(binary);
      }
      case 'base64-decode': {
        const clean = input.trim().replace(/^data:[^;]+;base64,/, '');
        if (typeof Buffer !== 'undefined') {
          return Buffer.from(clean, 'base64').toString('utf-8');
        }
        const binary = atob(clean);
        const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
        return new TextDecoder().decode(bytes);
      }
      case 'url-encode':
        return encodeURIComponent(input);
      case 'url-decode':
        return decodeURIComponent(input);
      case 'html-encode':
        return input
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      case 'html-decode':
        return input
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&amp;/g, '&');
    }
  } catch (err: unknown) {
    return `Error: ${err instanceof Error ? err.message : 'Invalid input for selected codec'}`;
  }
}

// ============================================================================
// 7. Text to TXT, Rich Markdown & AI Watermark Scrubber
// ============================================================================

export function scrubAiWatermarksAndFormat(
  input: string,
  options: {
    stripMarkdownSyntax?: boolean;
    lineEnding?: 'LF' | 'CRLF';
  } = {}
): {
  cleanedText: string;
  removedZeroWidthCount: number;
  removedNbspCount: number;
} {
  const zwMatches = input.match(/[\u200B\u200C\u200D\uFEFF\u2060]/g);
  const nbspMatches = input.match(/\u00A0/g);

  let out = input
    .replace(/[\u200B\u200C\u200D\uFEFF\u2060]/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");

  if (options.stripMarkdownSyntax) {
    out = out
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/^\s*[-*+]\s+/gm, '• ');
  }

  out = out.replace(/\r?\n/g, options.lineEnding === 'CRLF' ? '\r\n' : '\n');

  return {
    cleanedText: out,
    removedZeroWidthCount: zwMatches ? zwMatches.length : 0,
    removedNbspCount: nbspMatches ? nbspMatches.length : 0,
  };
}

// ============================================================================
// 8. Word Counter, N-Gram SEO Density & SERP Pixel Width Calculator
// ============================================================================

const STOP_WORDS = new Set([
  'the', 'and', 'to', 'of', 'in', 'a', 'is', 'that', 'for', 'on', 'with', 'as', 'are', 'this',
  'by', 'be', 'at', 'or', 'from', 'an', 'it', 'not', 'have', 'has', 'was', 'were', 'but', 'all',
  'your', 'can', 'we', 'you', 'our', 'their', 'into', 'more', 'will', 'about', 'which', 'when',
]);

export interface KeywordDensityRow {
  phrase: string;
  count: number;
  densityPercent: number;
}

export function analyzeSeoWordDensity(text: string): {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTimeSec: number;
  speakingTimeSec: number;
  titlePixelWidth: number;
  unigrams: KeywordDensityRow[];
  bigrams: KeywordDensityRow[];
  trigrams: KeywordDensityRow[];
} {
  const clean = text.trim();
  if (!clean) {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      readingTimeSec: 0,
      speakingTimeSec: 0,
      titlePixelWidth: 0,
      unigrams: [],
      bigrams: [],
      trigrams: [],
    };
  }

  const rawWords = clean
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const totalWords = rawWords.length;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const sentences = Math.max(1, clean.split(/[.!?]+/).filter((s) => s.trim().length > 0).length);
  const paragraphs = Math.max(1, clean.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length);

  const readingTimeSec = Math.ceil((totalWords / 225) * 60);
  const speakingTimeSec = Math.ceil((totalWords / 140) * 60);

  // First line SERP pixel estimation (Arial 20px average char width table)
  const firstLine = clean.split('\n')[0].slice(0, 100);
  let titlePixelWidth = 0;
  for (const ch of firstLine) {
    if ('ilI1|.,:;! '.includes(ch)) titlePixelWidth += 5;
    else if ('MW@%&QOG'.includes(ch)) titlePixelWidth += 13;
    else if (ch >= 'A' && ch <= 'Z') titlePixelWidth += 10.5;
    else titlePixelWidth += 8.8;
  }
  titlePixelWidth = Math.round(titlePixelWidth);

  const filtered = rawWords.filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const countNGrams = (tokens: string[], n: number): KeywordDensityRow[] => {
    const map = new Map<string, number>();
    for (let i = 0; i <= tokens.length - n; i++) {
      const gram = tokens.slice(i, i + n).join(' ');
      map.set(gram, (map.get(gram) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([phrase, count]) => ({
        phrase,
        count,
        densityPercent: Number(((count / Math.max(1, totalWords)) * 100).toFixed(2)),
      }));
  };

  return {
    words: totalWords,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    readingTimeSec,
    speakingTimeSec,
    titlePixelWidth,
    unigrams: countNGrams(filtered, 1),
    bigrams: countNGrams(filtered, 2),
    trigrams: countNGrams(filtered, 3),
  };
}

// ============================================================================
// 9. Case Converter (12 Cases) & Bulk SEO Slug Generator
// ============================================================================

export function convertTextCases(input: string, removeStopWordsInSlug = true): Record<string, string> {
  const words = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const lowerWords = words.map((w) => w.toLowerCase());
  const slugWords = removeStopWordsInSlug
    ? lowerWords.filter((w) => !STOP_WORDS.has(w) || lowerWords.length <= 2)
    : lowerWords;

  const capitalize = (w: string) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : '');

  // Bulk multi-line SEO slugs
  const bulkSlugs = input
    .split(/\r?\n/)
    .map((line) => {
      const lw = line
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      const sw = removeStopWordsInSlug ? lw.filter((w) => !STOP_WORDS.has(w) || lw.length <= 2) : lw;
      return sw.join('-');
    })
    .filter(Boolean)
    .join('\n');

  return {
    UPPERCASE: input.toUpperCase(),
    lowercase: input.toLowerCase(),
    'Title Case': lowerWords.map(capitalize).join(' '),
    'Sentence case': input
      .toLowerCase()
      .replace(/(^\s*[a-z]|[.!?]\s+[a-z])/g, (c) => c.toUpperCase()),
    camelCase: lowerWords.map((w, i) => (i === 0 ? w : capitalize(w))).join(''),
    PascalCase: lowerWords.map(capitalize).join(''),
    snake_case: lowerWords.join('_'),
    'kebab-case': lowerWords.join('-'),
    CONSTANT_CASE: lowerWords.map((w) => w.toUpperCase()).join('_'),
    'dot.case': lowerWords.join('.'),
    'path/case': lowerWords.join('/'),
    'SEO URL Slug (Stop-Words Stripped)': slugWords.join('-') || lowerWords.join('-'),
    'Bulk Slugs (Per Line)': bulkSlugs,
  };
}

// ============================================================================
// 10. Duplicate Line & List Cleaner
// ============================================================================

export function cleanDuplicateLines(
  input: string,
  options: {
    caseSensitive?: boolean;
    trimWhitespace?: boolean;
    removeEmpty?: boolean;
    sortMode?: 'none' | 'asc' | 'desc' | 'length';
    prefix?: string;
    suffix?: string;
  } = {}
): {
  output: string;
  originalCount: number;
  uniqueCount: number;
  removedDuplicates: number;
} {
  const rawLines = input.split(/\r?\n/);
  const originalCount = rawLines.length;
  const seen = new Set<string>();
  const kept: string[] = [];

  for (let line of rawLines) {
    if (options.trimWhitespace !== false) {
      line = line.trim();
    }
    if (options.removeEmpty !== false && line.length === 0) {
      continue;
    }
    const key = options.caseSensitive ? line : line.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      kept.push(line);
    }
  }

  if (options.sortMode === 'asc') {
    kept.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  } else if (options.sortMode === 'desc') {
    kept.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  } else if (options.sortMode === 'length') {
    kept.sort((a, b) => a.length - b.length);
  }

  const prefix = options.prefix ?? '';
  const suffix = options.suffix ?? '';
  const finalLines = kept.map((l) => `${prefix}${l}${suffix}`);

  return {
    output: finalLines.join('\n'),
    originalCount,
    uniqueCount: finalLines.length,
    removedDuplicates: Math.max(0, originalCount - finalLines.length),
  };
}

// ============================================================================
// 11. Crypto Password, BIP39 Passphrase, UUID & Entropy Calculator
// ============================================================================

const WORD_LIST = [
  'anchor', 'aurora', 'beacon', 'breeze', 'canyon', 'cipher', 'cobalt', 'cosmos', 'crystal',
  'delta', 'eclipse', 'ember', 'falcon', 'fjord', 'flux', 'galaxy', 'granite', 'harbor',
  'helios', 'horizon', 'indigo', 'ivory', 'jasper', 'krypton', 'lagoon', 'lantern', 'lithium',
  'magnet', 'matrix', 'meadow', 'mercury', 'meteor', 'mirage', 'monolith', 'nebula', 'nectar',
  'nimbus', 'obsidian', 'omega', 'onyx', 'orbit', 'osmium', 'paradox', 'phoenix', 'photon',
  'pioneer', 'plasma', 'polaris', 'prism', 'pulsar', 'quantum', 'quartz', 'quasar', 'radium',
  'reactor', 'redwood', 'zenith', 'zephyr', 'zircon', 'vortex', 'vector', 'velvet', 'vermilion',
];

function getSecureRandomInt(max: number): number {
  const array = new Uint32Array(1);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
    return array[0] % max;
  }
  return Math.floor(Math.random() * max);
}

export function generateCryptoSecret(options: {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}): {
  password: string;
  passphrase: string;
  uuidV4: string;
  jwtSecretHex: string;
  entropyBits: number;
  crackTimeLabel: string;
} {
  let pool = '';
  if (options.uppercase) pool += 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  if (options.lowercase) pool += 'abcdefghijkmnopqrstuvwxyz';
  if (options.numbers) pool += '23456789';
  if (options.symbols) pool += '!@#$%^&*()-_=+[]{}<>?';
  if (!pool) pool = 'abcdefghijkmnopqrstuvwxyz23456789';

  let password = '';
  for (let i = 0; i < options.length; i++) {
    password += pool[getSecureRandomInt(pool.length)];
  }

  const words: string[] = [];
  for (let i = 0; i < 5; i++) {
    words.push(WORD_LIST[getSecureRandomInt(WORD_LIST.length)]);
  }
  const passphrase = `${words.join('-')}-${getSecureRandomInt(900) + 100}`;

  const hexChars = '0123456789abcdef';
  let jwtSecretHex = '';
  for (let i = 0; i < 64; i++) {
    jwtSecretHex += hexChars[getSecureRandomInt(16)];
  }

  const uuidV4 =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = getSecureRandomInt(16);
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });

  const entropyBits = Math.round(options.length * Math.log2(pool.length));
  let crackTimeLabel = 'Instantly (< 1 sec)';
  if (entropyBits >= 128) crackTimeLabel = 'Centuries (Quantum-Resistant Margin)';
  else if (entropyBits >= 90) crackTimeLabel = '3.4+ Million Years (100B guesses/sec)';
  else if (entropyBits >= 72) crackTimeLabel = '450+ Years (Offline GPU Cluster)';
  else if (entropyBits >= 56) crackTimeLabel = '~2 Weeks (Dedicated Rig)';
  else if (entropyBits >= 40) crackTimeLabel = '~3 Minutes';

  return { password, passphrase, uuidV4, jwtSecretHex, entropyBits, crackTimeLabel };
}

// ============================================================================
// 12. Epoch & Timezone Converter
// ============================================================================

export function convertEpochTimestamp(input: string | number, nowMs = Date.now()): {
  valid: boolean;
  detectedUnit: 'seconds (10-digit)' | 'milliseconds (13-digit)' | 'nanoseconds (19-digit)' | 'ISO-8601 Date';
  epochSeconds: number;
  epochMilliseconds: number;
  iso8601: string;
  utcString: string;
  relativeLabel: string;
  cities: { city: string; zone: string; formatted: string }[];
} {
  const raw = String(input).trim();
  let ms = nowMs;
  let detectedUnit: 'seconds (10-digit)' | 'milliseconds (13-digit)' | 'nanoseconds (19-digit)' | 'ISO-8601 Date' =
    'seconds (10-digit)';

  if (/^-?\d+$/.test(raw)) {
    const num = Number(raw);
    if (raw.replace('-', '').length <= 10) {
      detectedUnit = 'seconds (10-digit)';
      ms = num * 1000;
    } else if (raw.replace('-', '').length <= 14) {
      detectedUnit = 'milliseconds (13-digit)';
      ms = num;
    } else {
      detectedUnit = 'nanoseconds (19-digit)';
      ms = Math.floor(num / 1_000_000);
    }
  } else {
    const parsed = Date.parse(raw);
    if (Number.isNaN(parsed)) {
      return {
        valid: false,
        detectedUnit: 'seconds (10-digit)',
        epochSeconds: 0,
        epochMilliseconds: 0,
        iso8601: 'Invalid Timestamp',
        utcString: 'Invalid Timestamp',
        relativeLabel: 'Invalid input',
        cities: [],
      };
    }
    detectedUnit = 'ISO-8601 Date';
    ms = parsed;
  }

  const date = new Date(ms);
  const diffSec = Math.round((ms - nowMs) / 1000);
  let relativeLabel = 'Just now';
  if (Math.abs(diffSec) >= 86400) {
    const days = Math.round(Math.abs(diffSec) / 86400);
    relativeLabel = diffSec > 0 ? `in ${days} day(s)` : `${days} day(s) ago`;
  } else if (Math.abs(diffSec) >= 3600) {
    const hrs = Math.round(Math.abs(diffSec) / 3600);
    relativeLabel = diffSec > 0 ? `in ${hrs} hour(s)` : `${hrs} hour(s) ago`;
  } else if (Math.abs(diffSec) >= 60) {
    const mins = Math.round(Math.abs(diffSec) / 60);
    relativeLabel = diffSec > 0 ? `in ${mins} minute(s)` : `${mins} minute(s) ago`;
  }

  const zones = [
    { city: 'UTC / GMT', zone: 'UTC' },
    { city: 'San Francisco (PT)', zone: 'America/Los_Angeles' },
    { city: 'New York (ET)', zone: 'America/New_York' },
    { city: 'London (UK)', zone: 'Europe/London' },
    { city: 'Berlin (CET)', zone: 'Europe/Berlin' },
    { city: 'Tokyo (JST)', zone: 'Asia/Tokyo' },
  ];

  const cities = zones.map((z) => ({
    city: z.city,
    zone: z.zone,
    formatted: new Intl.DateTimeFormat('en-US', {
      timeZone: z.zone,
      dateStyle: 'medium',
      timeStyle: 'long',
    }).format(date),
  }));

  return {
    valid: true,
    detectedUnit,
    epochSeconds: Math.floor(ms / 1000),
    epochMilliseconds: ms,
    iso8601: date.toISOString(),
    utcString: date.toUTCString(),
    relativeLabel,
    cities,
  };
}

// ============================================================================
// 13. Cron Expression Studio (AST Parser & Next 10 Executions)
// ============================================================================

const DOW_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function parseCronExpression(
  cron: string,
  fromDate = new Date()
): {
  valid: boolean;
  humanReadable: string;
  nextExecutions: string[];
  fields?: { minute: string; hour: string; dayOfMonth: string; month: string; dayOfWeek: string };
  error?: string;
} {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) {
    return {
      valid: false,
      humanReadable: 'Cron expression must have exactly 5 fields: [minute] [hour] [day-of-month] [month] [day-of-week]',
      nextExecutions: [],
      error: 'Expected 5 space-separated fields.',
    };
  }

  const [minField, hourField, domField, monField, dowField] = parts;

  const describeField = (val: string, unit: string, names?: string[]): string => {
    if (val === '*') return `every ${unit}`;
    if (val.startsWith('*/')) return `every ${val.slice(2)} ${unit}s`;
    if (names && /^\d+$/.test(val)) {
      const idx = parseInt(val, 10);
      if (names[idx]) return `on ${names[idx]}`;
    }
    return `at ${unit} ${val}`;
  };

  let human = 'Runs ';
  if (minField === '0' && hourField === '0' && domField === '*' && monField === '*' && dowField === '*') {
    human = 'Runs every day at midnight (00:00 UTC)';
  } else if (minField.startsWith('*/') && hourField === '*') {
    human = `Runs every ${minField.slice(2)} minutes, every day`;
  } else {
    const minDesc = minField === '0' ? 'at minute 0' : describeField(minField, 'minute');
    const hrDesc = hourField === '*' ? 'of every hour' : `past hour ${hourField}`;
    const domDesc = domField === '*' ? '' : `, on day ${domField} of the month`;
    const monDesc = monField === '*' ? '' : `, in ${MONTH_NAMES[parseInt(monField, 10)] || `month ${monField}`}`;
    const dowDesc = dowField === '*' ? '' : `, ${describeField(dowField, 'day-of-week', DOW_NAMES)}`;
    human = `Runs ${minDesc} ${hrDesc}${domDesc}${monDesc}${dowDesc}.`;
  }

  const matchesCronField = (field: string, value: number): boolean => {
    if (field === '*') return true;
    if (field.startsWith('*/')) {
      const step = parseInt(field.slice(2), 10);
      return step > 0 && value % step === 0;
    }
    return field.split(',').some((segment) => {
      if (segment.includes('-')) {
        const [s, e] = segment.split('-').map((n) => parseInt(n, 10));
        return value >= s && value <= e;
      }
      return parseInt(segment, 10) === value;
    });
  };

  const nextExecutions: string[] = [];
  const cursor = new Date(fromDate.getTime());
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);

  let iterations = 0;
  while (nextExecutions.length < 10 && iterations < 50000) {
    iterations++;
    const m = cursor.getMinutes();
    const h = cursor.getHours();
    const dom = cursor.getDate();
    const mon = cursor.getMonth() + 1;
    const dow = cursor.getDay();

    if (
      matchesCronField(minField, m) &&
      matchesCronField(hourField, h) &&
      matchesCronField(domField, dom) &&
      matchesCronField(monField, mon) &&
      matchesCronField(dowField, dow)
    ) {
      nextExecutions.push(cursor.toISOString().replace('T', ' ').slice(0, 16) + ' UTC');
    }
    cursor.setMinutes(cursor.getMinutes() + 1);
  }

  return {
    valid: true,
    humanReadable: human,
    nextExecutions,
    fields: {
      minute: minField,
      hour: hourField,
      dayOfMonth: domField,
      month: monField,
      dayOfWeek: dowField,
    },
  };
}

// ============================================================================
// 14. PDF Page Range Parser (`1-3, 5, 8-10`)
// ============================================================================

export function parsePageRanges(rangeStr: string, maxPages: number): number[] {
  const pages = new Set<number>();
  const parts = rangeStr
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startRaw, endRaw] = part.split('-').map((n) => parseInt(n.trim(), 10));
      if (!Number.isNaN(startRaw) && !Number.isNaN(endRaw)) {
        const start = Math.max(1, Math.min(startRaw, endRaw));
        const end = Math.min(maxPages, Math.max(startRaw, endRaw));
        for (let p = start; p <= end; p++) {
          pages.add(p - 1); // 0-indexed for pdf-lib
        }
      }
    } else {
      const p = parseInt(part, 10);
      if (!Number.isNaN(p) && p >= 1 && p <= maxPages) {
        pages.add(p - 1);
      }
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
}
