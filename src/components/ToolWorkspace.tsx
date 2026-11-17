import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ByteGauge, type ByteGaugeProps } from './ByteGauge';
import {
  UploadCloud,
  Zap,
  ShieldCheck,
  Copy,
  Check,
  Download,
  Sparkles,
  Trash2,
  ClipboardPaste,
  FileArchive,
  RotateCcw,
  ChevronRight,
  Image as ImageIcon,
  FileText,
  Code2,
  Type,
  Calculator,
  Wrench,
  Star,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  X,
  Columns2,
} from 'lucide-react';
import { ToolDefinition, HubId, getHubById } from '../data/toolsCatalog';
import { TOOL_EDITORIAL_LINKS } from '../data/seoSchemaData';
import {
  processJsonInput,
  jsonToCsv,
  jsonToYaml,
  jsonToTypeScript,
  jsonToSql,
  estimateBpeTokens,
  packFilesForLlm,
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
} from '../utils/toolEngines';
import type { ProcessedFileItem } from '../utils/binaryEngines';
import { NineZoneSeoContent } from './NineZoneSeoContent';
import { BreadcrumbsNav } from './BreadcrumbsNav';
import { ImageCompareModal } from './ImageCompareModal';

/** Honest, user-facing status messages for features whose engine is not shipped yet. */


export const OCR_NOTICE =
  'OCR is not available in this build. No text-recognition engine is bundled, so this tool does not extract text from images yet. The previous version echoed input text and presented it as recognised output, which was misleading. Your image is untouched and was not uploaded anywhere.';

export interface ChainedToolPayload {
  text?: string;
  files?: File[];
  fromToolName: string;
}

interface ToolWorkspaceProps {
  tool: ToolDefinition;
  onNavigateHome: () => void;
  onSelectHub: (hubId: HubId) => void;
  onSelectTool: (toolId: string) => void;
  onOpenAiModal: (context: string) => void;
  /** The AI assistant has no working backend in the static deployment. */
  aiAssistantEnabled?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (toolId: string) => void;
  chainedPayload?: ChainedToolPayload | null;
  onChainToTool?: (targetToolId: string, payload: ChainedToolPayload) => void;
}

const SAMPLE_TEXT_PRESETS: Record<string, string> = {
  'json-formatter-validator': `{\n  // Malformed JSON with single quotes, unquoted keys & trailing comma\n  platform: 'NextGenToolkit',\n  domain: 'https://nextgentoolkit.pages.dev',\n  processingModel: 'Depends on the selected utility',\n  coreTools: 'Many process locally in the browser',\n  remoteFeatures: 'May send data needed for the operation to the relevant provider',\n  hubs: ['PDF Tools', 'Image Tools', 'Developer Tools', 'Text Tools', 'Generators'],\n  coreWebVitals: { lcpMs: 420, inpMs: 18, cls: 0.000, },\n}`,
  'llm-token-counter': `import { PDFDocument } from 'pdf-lib';\n\n// Client-side PDF compression example\nexport async function compressPdfInBrowser(buffer: ArrayBuffer, targetKb: number) {\n  const doc = await PDFDocument.load(buffer);\n  doc.setTitle('');\n  doc.setAuthor('');\n  return await doc.save({ useObjectStreams: true });\n}`,
  'regex-tester': `Contact our engineering team at architecture@nextgentoolkit.dev or security@nextgentoolkit.io.\nServer nodes: 192.168.1.104 and 10.24.88.12.\nRelease date: 2025-02-20T09:30:00Z | Order #NGT-99412.`,
  'jwt-decoder': `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzk4NDEyIiwibmFtZSI6IlNhYmlyIEFyYWluIChOZXh0R2VuVG9vbGtpdCBBcmNoaXRlY3QpIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzMxNDgwMDAwLCJleHAiOjE5OTk5OTk5OTl9.nextgentoolkit_client_side_verified_signature`,
  'code-diff-checker': `function calculateCompressionTarget(sizeKb) {\n  const maxUpload = 50;\n  return sizeKb * 0.85;\n}`,
  'base64-url-encoder': `NextGenToolkit: many core tools process locally; remote features may use providers ✓`,
  'text-to-txt-markdown': `## Executive Summary\u200B\uFEFF\n\nCopied from **ChatGPT / Claude** with hidden\u00A0zero-width watermarks (\u200B) and “smart quotes”.\n\n- Local processing for supported core tools\n- Multi-File Batch ZIP Export`,
  'word-counter-density': `Many core PDF utilities process files locally in the browser using client-side libraries. Processing and file-size results depend on the selected tool and input document.`,
  'case-converter-slug-generator': `How to Compress a PDF Under 200KB Online Without Uploading\nBulk WebP and Image Format Converter for Core Web Vitals\nJSON Formatter Validator and Broken Syntax Auto Fixer`,
  'duplicate-line-remover': `compress-pdf\njson-formatter\nmerge-pdf\ncompress-pdf\nllm-token-counter\njson-formatter\ncustom-qr-code-generator\nmerge-pdf`,
  'custom-qr-code-generator': `https://nextgentoolkit.pages.dev`,
  'password-api-key-generator': `24`,
  'unix-timestamp-converter': `1740052800`,
  'cron-expression-generator': `*/15 * * * *`,
};

export function ToolWorkspace({
  tool,
  onNavigateHome,
  onSelectHub,
  onSelectTool,
  onOpenAiModal,
  aiAssistantEnabled = false,
  isFavorite = false,
  onToggleFavorite,
  chainedPayload = null,
  onChainToTool,
}: ToolWorkspaceProps) {
  const hub = getHubById(tool.hubId);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isBinaryFileTool =
    tool.hubId === 'pdf-tools' ||
    (tool.hubId === 'image-tools' && tool.id !== 'image-to-text-ocr');

  // Shared Workspace State
  const [inputText, setInputText] = useState<string>('');
  const [secondaryText, setSecondaryText] = useState<string>(
    `function calculateCompressionTarget(sizeKb, strictPortalLimit = true) {\n  const zeroServerUpload = true;\n  return strictPortalLimit ? Math.min(sizeKb, 100) : sizeKb * 0.75;\n}`
  );
  const [outputText, setOutputText] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [processedItems, setProcessedItems] = useState<ProcessedFileItem[]>([]);
  const [forensicTable, setForensicTable] = useState<Record<string, string> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  // Cooperative cancellation: engines check this between files and between PDF
  // pages, so Cancel stops real work instead of only hiding the spinner.
  const cancelRequestedRef = useRef(false);
  const [cancelAvailable, setCancelAvailable] = useState(false);
  const [processingNotice, setProcessingNotice] = useState<string | null>(null);
  const [gauge, setGauge] = useState<ByteGaugeProps | null>(null);
  const processedItemsRef = useRef<ProcessedFileItem[]>([]);
  const [executionDurationMs, setExecutionDurationMs] = useState<number | null>(null);
  const [chainedFromLabel, setChainedFromLabel] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showZeroUploadVerify, setShowZeroUploadVerify] = useState(false);
  const [sessionRecovery, setSessionRecovery] = useState(true);

  // Tool-Specific Control States
  const [qualitySlider, setQualitySlider] = useState<number>(80);
  const [targetKb, setTargetKb] = useState<number>(() => {
    // Deep links such as /image-tools/compress-image-to-kb/?kb=20 land with the
    // preset already selected instead of forcing a second click.
    try {
      const preset = Number(new URLSearchParams(window.location.search).get('kb'));
      if ([10, 20, 50, 100, 200, 500].includes(preset)) return preset;
    } catch {
      // Ignore malformed URLs.
    }
    return 100;
  });
  const [imageOutputFormat, setImageOutputFormat] = useState<'image/webp' | 'image/jpeg' | 'image/png'>('image/webp');
  const [pdfRotation, setPdfRotation] = useState<number>(0);
  // Splitting needs an explicit range; rendering defaults to the whole document.
  const [pdfRangeSyntax, setPdfRangeSyntax] = useState<string>('1-2');
  const [pdfImagePages, setPdfImagePages] = useState<string>('all');
  const [pdfDpi, setPdfDpi] = useState<150 | 300 | 600>(300);
  const [pdfPageSize, setPdfPageSize] = useState<'A4' | 'Letter' | 'Fit'>('A4');
  const [pdfOrientation, setPdfOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [pdfStampNumbers, setPdfStampNumbers] = useState<boolean>(true);

  // Dev / Text / Generator Control States
  const [jsonFormatTab, setJsonFormatTab] = useState<'json' | 'csv' | 'yaml' | 'ts' | 'sql'>('json');
  const [jsonIndent, setJsonIndent] = useState<number>(2);
  const [jsonErrorInfo, setJsonErrorInfo] = useState<string | null>(null);
  const [jsonRepairedBanner, setJsonRepairedBanner] = useState<boolean>(false);

  const [regexPattern, setRegexPattern] = useState<string>('([a-zA-Z0-9._+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})');
  const [regexFlags, setRegexFlags] = useState<string>('gi');
  const [regexLangTab, setRegexLangTab] = useState<'js' | 'python' | 'go'>('js');

  const [diffIgnoreWhitespace, setDiffIgnoreWhitespace] = useState<boolean>(false);
  const [diffIgnoreCase, setDiffIgnoreCase] = useState<boolean>(false);

  const [codecMode, setCodecMode] = useState<
    'base64-encode' | 'base64-decode' | 'url-encode' | 'url-decode' | 'html-encode' | 'html-decode'
  >('base64-encode');

  const [stripMarkdownToggle, setStripMarkdownToggle] = useState<boolean>(false);
  const [lineEndingMode, setLineEndingMode] = useState<'LF' | 'CRLF'>('LF');
  const [watermarkStats, setWatermarkStats] = useState<{ zw: number; nbsp: number }>({ zw: 0, nbsp: 0 });

  const [dedupCaseSensitive, setDedupCaseSensitive] = useState<boolean>(false);
  const [dedupSortMode, setDedupSortMode] = useState<'none' | 'asc' | 'desc' | 'length'>('asc');
  const [dedupPrefix, setDedupPrefix] = useState<string>('');
  const [dedupSuffix, setDedupSuffix] = useState<string>('');

  const [qrMode, setQrMode] = useState<'url' | 'wifi' | 'vcard'>('url');
  const [qrEcc, setQrEcc] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [qrDarkColor, setQrDarkColor] = useState<string>('#7047EB');
  const [qrLightColor, setQrLightColor] = useState<string>('#FFFFFF');
  const [qrOutput, setQrOutput] = useState<{ svgString: string; pngDataUrl: string } | null>(null);

  const [pwdLength, setPwdLength] = useState<number>(24);
  const [pwdUpper, setPwdUpper] = useState<boolean>(true);
  const [pwdLower, setPwdLower] = useState<boolean>(true);
  const [pwdNums, setPwdNums] = useState<boolean>(true);
  const [pwdSyms, setPwdSyms] = useState<boolean>(true);

  const [llmPackFormat, setLlmPackFormat] = useState<'xml' | 'markdown'>('xml');
  const [llmStripComments, setLlmStripComments] = useState<boolean>(false);
  const [compareItem, setCompareItem] = useState<ProcessedFileItem | null>(null);

  // Initialize default sample text or consume chained payload when switching tools
  useEffect(() => {
    setForensicTable(null);
    setJsonErrorInfo(null);
    setJsonRepairedBanner(false);
    setExecutionDurationMs(null);
    setCompareItem(null);

    if (chainedPayload) {
      setChainedFromLabel(chainedPayload.fromToolName);
      if (chainedPayload.files && chainedPayload.files.length > 0) {
        setUploadedFiles(chainedPayload.files);
        setProcessedItems([]);
        return;
      }
      if (typeof chainedPayload.text === 'string' && chainedPayload.text.length > 0) {
        setUploadedFiles([]);
        setProcessedItems([]);
        setInputText(chainedPayload.text);
        return;
      }
    } else {
      setChainedFromLabel(null);
    }

    setUploadedFiles([]);
    setProcessedItems([]);

    const savedKey = `ngt_session_${tool.id}`;
    const legacySaved = sessionRecovery ? localStorage.getItem(`utilix_session_${tool.id}`) : null;
    const saved = sessionRecovery ? (localStorage.getItem(savedKey) ?? legacySaved) : null;
    if (saved) {
      setInputText(saved);
    } else {
      setInputText(SAMPLE_TEXT_PRESETS[tool.id] || '');
    }
  }, [tool.id, sessionRecovery, chainedPayload]);

  // Save input to localStorage when sessionRecovery is enabled
  useEffect(() => {
    if (sessionRecovery && inputText && !isBinaryFileTool) {
      localStorage.setItem(`ngt_session_${tool.id}`, inputText);
    }
  }, [inputText, tool.id, sessionRecovery, isBinaryFileTool]);

  // Reactive Calculation for Text / Dev / Generator Tools
  const runReactiveTextEngine = useCallback(
    (autoFixJson = false) => {
      switch (tool.id) {
        case 'json-formatter-validator': {
          const res = processJsonInput(inputText, jsonIndent, autoFixJson);
          if (!res.valid) {
            setJsonErrorInfo(
              `Syntax Error near Line ${res.errorLine ?? 1}, Col ${res.errorColumn ?? 1}: ${res.errorMessage}`
            );
            setJsonRepairedBanner(false);
            setOutputText(inputText);
          } else {
            setJsonErrorInfo(null);
            setJsonRepairedBanner(res.repaired);
            if (autoFixJson && res.repaired) {
              setInputText(res.formatted);
            }
            if (jsonFormatTab === 'json') {
              setOutputText(jsonIndent === 0 ? res.minified : res.formatted);
            } else if (jsonFormatTab === 'csv') {
              setOutputText(jsonToCsv(res.parsedValue));
            } else if (jsonFormatTab === 'yaml') {
              setOutputText(jsonToYaml(res.parsedValue));
            } else if (jsonFormatTab === 'ts') {
              setOutputText(jsonToTypeScript(res.parsedValue, 'NextGenToolkitPayload'));
            } else if (jsonFormatTab === 'sql') {
              setOutputText(jsonToSql(res.parsedValue, 'nextgentoolkit_dataset'));
            }
          }
          break;
        }
        case 'llm-token-counter': {
          const packed = packFilesForLlm(
            [
              { name: 'src/active-input.ts', content: inputText || '// Empty input' },
              ...(uploadedFiles.length > 0
                ? uploadedFiles.map((f) => ({ name: f.name, content: `// Attached file (${f.size} bytes)` }))
                : []),
            ],
            llmPackFormat,
            llmStripComments
          );
          setOutputText(packed);
          break;
        }
        case 'regex-tester': {
          const evaluated = evaluateRegex(regexPattern, regexFlags, inputText);
          const snippet =
            regexLangTab === 'js'
              ? `const regex = /${regexPattern}/${regexFlags};\nconst matches = [...text.matchAll(regex)];`
              : regexLangTab === 'python'
                ? `import re\nmatches = re.findall(r"${regexPattern}", text)`
                : `package main\nimport "regexp"\nvar re = regexp.MustCompile(\`${regexPattern}\`)`;

          const summary = [
            `=== MATCHES FOUND (${evaluated.matches.length}) ===`,
            ...evaluated.matches.map(
              (m, idx) =>
                `#${idx + 1} [index ${m.index}]: "${m.match}" ${
                  m.groups.length ? `| Groups: [${m.groups.join(', ')}]` : ''
                }`
            ),
            ``,
            `=== PLAIN-ENGLISH AST TOKEN BREAKDOWN ===`,
            ...evaluated.tokens.map((t) => `• ${t.token.padEnd(14, ' ')} → ${t.meaning}`),
            ``,
            `=== GENERATED ${regexLangTab.toUpperCase()} SNIPPET ===`,
            snippet,
          ].join('\n');
          setOutputText(evaluated.valid ? summary : `Regex Error: ${evaluated.error}`);
          break;
        }
        case 'jwt-decoder': {
          const jwt = decodeJwtToken(inputText);
          if (!jwt.valid) {
            setOutputText(`Invalid JWT: ${jwt.error}`);
          } else {
            setOutputText(
              JSON.stringify(
                {
                  status: jwt.timeRemainingText,
                  isExpired: jwt.isExpired,
                  timestamps: {
                    issuedAt_iat: jwt.issuedAtIso || 'N/A',
                    expiresAt_exp: jwt.expiresAtIso || 'N/A',
                    notBefore_nbf: jwt.notBeforeIso || 'N/A',
                  },
                  header: jwt.header,
                  payload: jwt.payload,
                  signatureSegment: jwt.signature,
                },
                null,
                2
              )
            );
          }
          break;
        }
        case 'code-diff-checker': {
          const diff = computeTextDiff(inputText, secondaryText, {
            ignoreWhitespace: diffIgnoreWhitespace,
            ignoreCase: diffIgnoreCase,
          });
          setOutputText(
            `Summary: +${diff.addedCount} Added Lines | -${diff.removedCount} Removed Lines\n\n${diff.patchText}`
          );
          break;
        }
        case 'base64-url-encoder': {
          setOutputText(encodeDecodeCodec(inputText, codecMode));
          break;
        }
        case 'text-to-txt-markdown': {
          const res = scrubAiWatermarksAndFormat(inputText, {
            stripMarkdownSyntax: stripMarkdownToggle,
            lineEnding: lineEndingMode,
          });
          setWatermarkStats({ zw: res.removedZeroWidthCount, nbsp: res.removedNbspCount });
          setOutputText(res.cleanedText);
          break;
        }
        case 'word-counter-density': {
          const stats = analyzeSeoWordDensity(inputText);
          const report = [
            `=== DOCUMENT & SERP METRICS ===`,
            `Words: ${stats.words} · Characters: ${stats.characters} (${stats.charactersNoSpaces} no spaces)`,
            `Sentences: ${stats.sentences} · Paragraphs: ${stats.paragraphs}`,
            `Reading Time: ~${stats.readingTimeSec}s · Speaking Time: ~${stats.speakingTimeSec}s`,
            `Google SERP Title Pixel Width: ${stats.titlePixelWidth}px / 600px (${
              stats.titlePixelWidth <= 600 ? 'OPTIMAL - No Truncation' : 'WARNING - Exceeds 600px'
            })`,
            ``,
            `=== 1-WORD KEYWORD DENSITY (STOP-WORDS FILTERED) ===`,
            ...stats.unigrams.map((u) => `• ${u.phrase.padEnd(20, ' ')} : ${u.count}x (${u.densityPercent}%)`),
            ``,
            `=== 2-WORD PHRASES (BIGRAMS) ===`,
            ...stats.bigrams.map((b) => `• ${b.phrase.padEnd(26, ' ')} : ${b.count}x (${b.densityPercent}%)`),
            ``,
            `=== 3-WORD PHRASES (TRIGRAMS) ===`,
            ...stats.trigrams.map((t) => `• ${t.phrase.padEnd(32, ' ')} : ${t.count}x (${t.densityPercent}%)`),
          ].join('\n');
          setOutputText(report);
          break;
        }
        case 'case-converter-slug-generator': {
          const cases = convertTextCases(inputText, true);
          setOutputText(
            Object.entries(cases)
              .map(([label, val]) => `[${label}]\n${val}`)
              .join('\n\n')
          );
          break;
        }
        case 'duplicate-line-remover': {
          const cleaned = cleanDuplicateLines(inputText, {
            caseSensitive: dedupCaseSensitive,
            sortMode: dedupSortMode,
            prefix: dedupPrefix,
            suffix: dedupSuffix,
          });
          setOutputText(
            `// Original Lines: ${cleaned.originalCount} · Unique Kept: ${cleaned.uniqueCount} · Duplicates Stripped: ${cleaned.removedDuplicates}\n` +
              cleaned.output
          );
          break;
        }
        case 'custom-qr-code-generator': {
          let payload = inputText || 'https://nextgentoolkit.pages.dev';
          if (qrMode === 'wifi' && !payload.startsWith('WIFI:')) {
            payload = `WIFI:T:WPA;S:${payload};P:NextGenSecurePass2025;;`;
          } else if (qrMode === 'vcard' && !payload.startsWith('BEGIN:VCARD')) {
            payload = `BEGIN:VCARD\nVERSION:3.0\nFN:${payload}\nURL:https://nextgentoolkit.pages.dev\nEND:VCARD`;
          }
          import('../utils/binaryEngines').then(({ generateCustomQrCode }) => generateCustomQrCode({
            payload,
            errorCorrectionLevel: qrEcc,
            darkColor: qrDarkColor,
            lightColor: qrLightColor,
            margin: 2,
          })).then((res) => {
            setQrOutput(res);
            setOutputText(res.svgString);
          });
          break;
        }
        case 'password-api-key-generator': {
          const sec = generateCryptoSecret({
            length: pwdLength,
            uppercase: pwdUpper,
            lowercase: pwdLower,
            numbers: pwdNums,
            symbols: pwdSyms,
          });
          setOutputText(
            [
              `CSPRNG Password (${pwdLength} chars) : ${sec.password}`,
              `Shannon Entropy & Resistance : ${sec.entropyBits} bits (${sec.crackTimeLabel})`,
              `BIP39-Style 5-Word Passphrase: ${sec.passphrase}`,
              `UUID v4 (RFC 4122)           : ${sec.uuidV4}`,
              `256-Bit JWT / HMAC Secret    : ${sec.jwtSecretHex}`,
            ].join('\n\n')
          );
          break;
        }
        case 'unix-timestamp-converter': {
          const ts = convertEpochTimestamp(inputText || '1763029544');
          if (!ts.valid) {
            setOutputText('Invalid Unix Timestamp or ISO-8601 Date.');
          } else {
            setOutputText(
              [
                `Auto-Detected Precision : ${ts.detectedUnit}`,
                `Epoch Seconds (10-digit): ${ts.epochSeconds}`,
                `Epoch Millis (13-digit) : ${ts.epochMilliseconds}`,
                `ISO-8601 String         : ${ts.iso8601}`,
                `UTC / RFC-7231          : ${ts.utcString}`,
                `Relative Time           : ${ts.relativeLabel}`,
                ``,
                `=== MULTI-CITY DEVELOPER TIMEZONE GRID ===`,
                ...ts.cities.map((c) => `• ${c.city.padEnd(22, ' ')} : ${c.formatted}`),
              ].join('\n')
            );
          }
          break;
        }
        case 'cron-expression-generator': {
          const cron = parseCronExpression(inputText || '*/15 * * * *');
          if (!cron.valid) {
            setOutputText(cron.humanReadable);
          } else {
            setOutputText(
              [
                `Plain-English Schedule: ${cron.humanReadable}`,
                `Fields: min(${cron.fields?.minute}) hour(${cron.fields?.hour}) dom(${cron.fields?.dayOfMonth}) month(${cron.fields?.month}) dow(${cron.fields?.dayOfWeek})`,
                ``,
                `=== NEXT 10 SCHEDULED EXECUTION DATES (UTC) ===`,
                ...cron.nextExecutions.map((d, i) => `${String(i + 1).padStart(2, '0')}. ${d}`),
              ].join('\n')
            );
          }
          break;
        }
        case 'image-to-text-ocr': {
          // No OCR engine is bundled in this build. Previously this branch echoed
          // the input (or canned sample text) and presented it as recognised text.
          // Emitting nothing is the only honest option until tesseract.js ships.
          setOutputText('');
          setProcessingNotice(OCR_NOTICE);
          break;
        }
      }
    },
    [
      tool.id,
      inputText,
      secondaryText,
      jsonIndent,
      jsonFormatTab,
      llmPackFormat,
      llmStripComments,
      uploadedFiles,
      regexPattern,
      regexFlags,
      regexLangTab,
      diffIgnoreWhitespace,
      diffIgnoreCase,
      codecMode,
      stripMarkdownToggle,
      lineEndingMode,
      dedupCaseSensitive,
      dedupSortMode,
      dedupPrefix,
      dedupSuffix,
      qrMode,
      qrEcc,
      qrDarkColor,
      qrLightColor,
      pwdLength,
      pwdUpper,
      pwdLower,
      pwdNums,
      pwdSyms,
    ]
  );

  useEffect(() => {
    if (!isBinaryFileTool) {
      runReactiveTextEngine(false);
    }
  }, [isBinaryFileTool, runReactiveTextEngine]);

  // Execute Binary File Processing (PDF & Image Tools)
  const executeBinaryFiles = useCallback(
    async (filesToProcess: File[]) => {
      if (filesToProcess.length === 0) return;
      const t0 = performance.now();
      setIsProcessing(true);
      cancelRequestedRef.current = false;
      setCancelAvailable(true);
      setForensicTable(null);
      setProcessingNotice(null);
      setGauge(null);
      // Release the previous run's blob URLs so long sessions cannot leak memory.
      for (const previous of processedItemsRef.current) {
        if (previous.previewUrl) URL.revokeObjectURL(previous.previewUrl);
      }

      try {
        // Keep the heavy PDF/image/ZIP engines out of the initial page bundle.
        const binary = await import('../utils/binaryEngines');
        const results: ProcessedFileItem[] = [];

        if (tool.id === 'compress-pdf') {
          for (const f of filesToProcess) {
            if (cancelRequestedRef.current) break;
            const res = await binary.compressPdfToTargetKb(f, targetKb);
            const statusLabel =
              res.status === 'met-target'
                ? `Target met (≤ ${targetKb} KB)`
                : res.status === 'already-below-target'
                  ? 'Already under the limit — returned unchanged'
                  : res.status === 'no-gain'
                    ? 'No gain possible — original returned unchanged'
                    : `Optimised, target NOT met (${Math.round(res.compressedSize / 1024)} KB)`;
            if (f === filesToProcess[0]) {
              setGauge({
                originalBytes: res.originalSize,
                outputBytes: res.compressedSize,
                targetBytes: targetKb * 1024,
                targetMet: res.targetMet,
                statusLabel,
                details: [`${res.pageCount} page${res.pageCount === 1 ? '' : 's'}`, 'structure rebuilt, page layout preserved'],
              });
            }
            results.push({
              id: `${f.name}-${Date.now()}`,
              name: `${f.name.replace(/\.pdf$/i, '')}-optimised.pdf`,
              originalSize: res.originalSize,
              outputSize: res.compressedSize,
              mimeType: 'application/pdf',
              blob: res.blob,
              metaSummary: {
                Pages: String(res.pageCount),
                Change:
                  res.savingsPercent > 0
                    ? `${res.savingsPercent}% smaller`
                    : res.returnedOriginal
                      ? '0% — original returned'
                      : '0%',
                Status: statusLabel,
              },
            });
          }
        } else if (tool.id === 'merge-pdf') {
          const res = await binary.mergePdfFilesClient(filesToProcess, pdfRotation);
          results.push({
            id: `merged-${Date.now()}`,
            name: `nextgentoolkit-merged-${filesToProcess.length}-files.pdf`,
            originalSize: res.totalOriginalBytes,
            outputSize: res.blob.size,
            mimeType: 'application/pdf',
            blob: res.blob,
            metaSummary: {
              'Merged Files': String(filesToProcess.length),
              'Total Pages': String(res.totalPages),
            },
          });
        } else if (tool.id === 'split-pdf') {
          for (const f of filesToProcess) {
            if (cancelRequestedRef.current) break;
            const res = await binary.splitPdfByRangesClient(f, pdfRangeSyntax);
            results.push({
              id: `split-${f.name}`,
              name: `${f.name.replace(/\.pdf$/i, '')}-pages-${pdfRangeSyntax.replace(/[^0-9,-]/g, '')}.pdf`,
              originalSize: f.size,
              outputSize: res.extractedBlob.size,
              mimeType: 'application/pdf',
              blob: res.extractedBlob,
              metaSummary: {
                'Extracted Pages': `${res.extractedCount} of ${res.totalPages}`,
                Range: pdfRangeSyntax,
              },
            });
          }
        } else if (tool.id === 'pdf-to-image') {
          // Real rasterisation with pdf.js. The module (and its worker) is only
          // fetched when this tool runs, so the rest of the site keeps its bundle.
          const raster = await import('../utils/pdfRasterBrowser');
          for (const f of filesToProcess) {
            if (cancelRequestedRef.current) break;
            const rendered = await raster.renderPdfPagesInBrowser(f, {
              pages: pdfImagePages.trim() || 'all',
              dpi: pdfDpi,
              format: imageOutputFormat,
              quality: qualitySlider / 100,
              shouldAbort: () => cancelRequestedRef.current,
            });
            if (rendered.pages.length === 0) {
              setProcessingNotice('No pages matched the page selection.');
            }
            if (rendered.skipped > 0) {
              const reason =
                rendered.truncatedReason === 'cancelled'
                  ? 'you cancelled the run'
                  : rendered.truncatedReason === 'pixel-budget'
                    ? 'the per-document pixel budget was reached (high DPI on a long document needs more memory than this device should give)'
                    : 'the per-run page cap was reached';
              setProcessingNotice(
                `Rendered ${rendered.pages.length} page${rendered.pages.length === 1 ? '' : 's'}. ${rendered.skipped} more were skipped because ${reason}. Lower the DPI or render them in a second run.`
              );
            }
            for (const page of rendered.pages) {
              const blob = new Blob([page.bytes as unknown as BlobPart], { type: page.mime });
              results.push({
                id: `${f.name}-p${page.pageNumber}-${Date.now()}`,
                name: page.name,
                originalSize: f.size,
                outputSize: blob.size,
                mimeType: page.mime,
                blob,
                previewUrl: URL.createObjectURL(blob),
                metaSummary: {
                  Page: `${page.pageNumber} of ${rendered.pageCount}`,
                  Dimensions: `${page.width} × ${page.height} px`,
                  'Render DPI': page.dpiReduced
                    ? `${page.dpi} DPI (lowered from ${pdfDpi} DPI to stay inside browser memory limits)`
                    : `${page.dpi} DPI`,
                  Format: page.mime.replace('image/', '').toUpperCase(),
                },
              });
            }
          }
        } else if (tool.id === 'image-to-pdf') {
          const res = await binary.convertImagesToPdfClient(filesToProcess, {
            pageSize: pdfPageSize,
            orientation: pdfOrientation,
            marginPx: 24,
            stampPageNumbers: pdfStampNumbers,
          });
          const totalOrig = filesToProcess.reduce((acc, f) => acc + f.size, 0);
          results.push({
            id: `images-to-pdf-${Date.now()}`,
            name: `nextgentoolkit-compiled-${res.pageCount}-pages.pdf`,
            originalSize: totalOrig,
            outputSize: res.blob.size,
            mimeType: 'application/pdf',
            blob: res.blob,
            metaSummary: {
              'Embedded Images': String(res.pageCount),
              Layout: `${pdfPageSize} (${pdfOrientation})`,
            },
          });
        } else if (tool.id === 'pdf-metadata-cleaner') {
          for (const f of filesToProcess) {
            if (cancelRequestedRef.current) break;
            const res = await binary.inspectAndCleanPdfMetadata(f, true);
            setForensicTable(res.metadata);
            results.push({
              id: `clean-${f.name}`,
              name: `${f.name.replace(/\.pdf$/i, '')}-sanitized.pdf`,
              originalSize: res.originalSize,
              outputSize: res.cleanedSize,
              mimeType: 'application/pdf',
              blob: res.cleanedBlob,
              metaSummary: { Status: '100% Info & XMP Tags Stripped' },
            });
          }
        } else if (tool.id === 'compress-image-to-kb') {
          for (const f of filesToProcess) {
            if (cancelRequestedRef.current) break;
            const res = await binary.compressImageToExactKbClient(f, targetKb, imageOutputFormat);
            const statusLabel =
              res.status === 'met-target'
                ? `Target met (≤ ${targetKb} KB)`
                : res.status === 'already-below-target'
                  ? 'Already under the limit — returned unchanged'
                  : res.status === 'best-effort'
                    ? `Best effort — still above target (${(res.outputSize / 1024).toFixed(1)} KB)`
                    : 'Target unreachable at usable quality';
            if (f === filesToProcess[0]) {
              setGauge({
                originalBytes: res.originalSize,
                outputBytes: res.outputSize,
                targetBytes: targetKb * 1024,
                targetMet: res.targetMet,
                statusLabel,
                details: [
                  `${res.actualMime.replace('image/', '').toUpperCase()}`,
                  `${res.finalDimensions}${res.scaled ? ' (scaled to fit the limit)' : ' (native dimensions)'}`,
                  res.achievedQuality === null ? 'lossless PNG' : `quality ${res.achievedQuality}%`,
                ],
              });
            }
            results.push({
              ...res,
              metaSummary: {
                'Target Limit': `≤ ${targetKb} KB`,
                Result: statusLabel,
                Output: `${res.actualMime.replace('image/', '').toUpperCase()} · ${res.finalDimensions}`,
                ...(res.formatFallback
                  ? { Format: `This browser could not encode ${res.requestedMime.replace('image/', '').toUpperCase()} — saved as ${res.actualMime.replace('image/', '').toUpperCase()}` }
                  : res.conversionSkipped
                    ? { Format: `Kept as ${res.actualMime.replace('image/', '').toUpperCase()} — the file already fits the limit, so converting it would only lose quality` }
                    : {}),
                ...(res.achievedQuality === null
                  ? { Lossless: res.scaled ? 'PNG kept lossless; resolution reduced to reach the limit' : 'PNG kept lossless' }
                  : { 'Quality Reached': `${res.achievedQuality}% (${res.iterations} passes)` }),
                ...(res.transparencyNote ? { Transparency: res.transparencyNote } : {}),
              },
            });
          }
        } else if (tool.id === 'bulk-webp-avif-converter') {
          for (const f of filesToProcess) {
            if (cancelRequestedRef.current) break;
            const res = await binary.transcodeImageClient(f, imageOutputFormat, qualitySlider / 100);
            results.push(res);
          }
        } else if (tool.id === 'exif-metadata-remover') {
          for (const f of filesToProcess) {
            if (cancelRequestedRef.current) break;
            const res = await binary.inspectAndScrubExifClient(f);
            setForensicTable(res.forensicTags);
            results.push(res.cleanItem);
          }
        } else if (tool.id === 'social-media-image-resizer') {
          const pack = await binary.generateSocialMediaBulkPack(filesToProcess[0]);
          results.push(...pack);
        }

        processedItemsRef.current = results;
        setProcessedItems(results);
        setExecutionDurationMs(Math.max(1, Math.round(performance.now() - t0)));
        if (cancelRequestedRef.current) {
          setProcessingNotice(
            results.length === 0
              ? 'Cancelled before the first file finished. Nothing was written and no file left your device.'
              : `Cancelled. ${results.length} finished file${results.length === 1 ? '' : 's'} kept below — the rest were not started.`
          );
        }
      } catch (error) {
        // Without this the engine's message ("Page 9 does not exist in this 1-page PDF.")
        // was only an unhandled rejection: the spinner stopped and the user got nothing.
        const message = error instanceof Error ? error.message : String(error);
        setProcessedItems([]);
        processedItemsRef.current = [];
        setGauge(null);
        setProcessingNotice(
          /does not exist|no pages|matched/i.test(message)
            ? `${message.replace(/\.$/, '')}. Use “all”, a single page or a range inside the document.`
            : message
        );
      } finally {
        setIsProcessing(false);
        setCancelAvailable(false);
      }
    },
    [
      tool.id,
      targetKb,
      pdfRotation,
      pdfRangeSyntax,
      pdfImagePages,
      pdfDpi,
      imageOutputFormat,
      pdfPageSize,
      pdfOrientation,
      pdfStampNumbers,
      qualitySlider,
    ]
  );

  // Re-run binary processing when settings change and files are loaded
  useEffect(() => {
    if (isBinaryFileTool && uploadedFiles.length > 0) {
      executeBinaryFiles(uploadedFiles);
    }
  }, [isBinaryFileTool, uploadedFiles, executeBinaryFiles]);

  // Load Sample Data Handler (Mandatory UX Upgrade #3)
  const handleLoadSampleData = async () => {
    if (tool.hubId === 'pdf-tools' && tool.id !== 'image-to-pdf') {
      const { createSamplePdfFile } = await import('../utils/binaryEngines');
      const samplePdf1 = await createSamplePdfFile('nextgentoolkit-financial-report-q4.pdf', 4);
      const samplePdf2 = await createSamplePdfFile('nextgentoolkit-architecture-annex.pdf', 2);
      const batch = tool.id === 'merge-pdf' ? [samplePdf1, samplePdf2] : [samplePdf1];
      setUploadedFiles(batch);
    } else if (tool.hubId === 'image-tools' || tool.id === 'image-to-pdf') {
      const { createSampleImageFile } = await import('../utils/binaryEngines');
      const sampleImg = await createSampleImageFile('nextgentoolkit-highres-sample.jpg');
      setUploadedFiles([sampleImg]);
      if (tool.id === 'image-to-text-ocr') {
        // No canned "recognised" text: an OCR preview must not invent output.
        setInputText('');
        setProcessingNotice(OCR_NOTICE);
      }
    } else {
      setInputText(SAMPLE_TEXT_PRESETS[tool.id] || 'NextGenToolkit Sample Input');
    }
  };

  // Global Keyboard Shortcuts (Mandatory UX Upgrade #5: Ctrl+Enter, Ctrl+Shift+C, Esc)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (isBinaryFileTool && uploadedFiles.length > 0) {
          executeBinaryFiles(uploadedFiles);
        } else {
          runReactiveTextEngine(false);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        if (outputText) {
          navigator.clipboard.writeText(outputText);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        }
      } else if (e.key === 'Escape') {
        setShowZeroUploadVerify(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isBinaryFileTool, uploadedFiles, executeBinaryFiles, runReactiveTextEngine, outputText]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      setUploadedFiles((prev) => [...prev, ...files]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setUploadedFiles((prev) => [...prev, ...files]);
    }
  };

  const moveQueuedFile = (index: number, delta: -1 | 1) => {
    setUploadedFiles((prev) => {
      const targetIdx = index + delta;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[targetIdx]] = [next[targetIdx], next[index]];
      return next;
    });
  };

  const removeQueuedFile = (index: number) => {
    setUploadedFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) {
        setProcessedItems([]);
        setForensicTable(null);
      }
      return next;
    });
  };

  const handleDownloadSingleItem = (item: ProcessedFileItem) => {
    const url = URL.createObjectURL(item.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const handleDownloadAllZip = async () => {
    if (processedItems.length > 0) {
      const { createBatchZipBlob } = await import('../utils/binaryEngines');
      const zipBlob = await createBatchZipBlob(
        processedItems.map((it) => ({ name: it.name, content: it.blob }))
      );
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nextgentoolkit-${tool.slug}-batch.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } else if (outputText) {
      const { createBatchZipBlob } = await import('../utils/binaryEngines');
      const ext =
        tool.id === 'custom-qr-code-generator'
          ? 'svg'
          : tool.id === 'code-diff-checker'
            ? 'patch'
            : tool.id === 'json-formatter-validator'
              ? jsonFormatTab
              : 'txt';
      const zipBlob = await createBatchZipBlob([
        { name: `nextgentoolkit-${tool.slug}-output.${ext}`, content: outputText },
      ]);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nextgentoolkit-${tool.slug}-archive.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }
  };

  const handleDownloadTextOutput = (extOverride?: string) => {
    const ext =
      extOverride ||
      (tool.id === 'custom-qr-code-generator'
        ? 'svg'
        : tool.id === 'code-diff-checker'
          ? 'patch'
          : tool.id === 'json-formatter-validator'
            ? jsonFormatTab
            : 'txt');
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nextgentoolkit-${tool.slug}.${ext}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const renderHubIcon = () => {
    switch (tool.hubId) {
      case 'image-tools':
        return <ImageIcon className="w-6 h-6" />;
      case 'pdf-tools':
        return <FileText className="w-6 h-6" />;
      case 'dev-tools':
        return <Code2 className="w-6 h-6" />;
      case 'text-tools':
        return <Type className="w-6 h-6" />;
      default:
        return <Calculator className="w-6 h-6" />;
    }
  };

  // Token stats if active tool is LLM Token Counter
  const tokenStats = tool.id === 'llm-token-counter' ? estimateBpeTokens(inputText) : null;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
      {/* =====================================================================
          ZONE 2: Breadcrumb Trail & Compact Title + Verifiable Zero-Upload Strip
      ===================================================================== */}
      <BreadcrumbsNav
        className="mb-4"
        items={[
          { label: 'Home', href: '/', onClick: onNavigateHome },
          {
            label: hub?.name || 'Tools',
            href: hub?.slug || '/',
            onClick: () => hub && onSelectHub(hub.id),
          },
          { label: tool.name, href: tool.canonicalPath, current: true },
        ]}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mt-0.5"
            style={{
              backgroundColor: hub?.accentBg || '#EDE7FF',
              color: hub?.accentFg || '#7047EB',
            }}
          >
            {renderHubIcon()}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171927] dark:text-[#F8F7FC] tracking-tight">
              {tool.name}
            </h1>
            {tool.status === 'preview' && (
              <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 text-[11px] font-bold uppercase tracking-wide">
                Preview — engine not shipped
              </span>
            )}
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              {tool.valuePropSubtitle}
            </p>
            {TOOL_EDITORIAL_LINKS[tool.id] && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-[#64748B] dark:text-[#94A3B8]">
                {TOOL_EDITORIAL_LINKS[tool.id].internalLinks[0] && (
                  <span>
                    Connected workflow:{' '}
                    <a
                      href={`${import.meta.env.BASE_URL.replace(/\/$/, '')}${TOOL_EDITORIAL_LINKS[tool.id].internalLinks[0].href}`}
                      onClick={(e) => {
                        const targetId = TOOL_EDITORIAL_LINKS[tool.id].internalLinks[0].toolId;
                        if (targetId) {
                          e.preventDefault();
                          onSelectTool(targetId);
                        }
                      }}
                      className="font-semibold text-[#7047EB] dark:text-[#A78BFA] underline decoration-[#7047EB]/40 hover:decoration-[#7047EB] underline-offset-2"
                    >
                      {TOOL_EDITORIAL_LINKS[tool.id].internalLinks[0].keywordAnchor}
                    </a>
                  </span>
                )}
                {TOOL_EDITORIAL_LINKS[tool.id].externalLinks[0] && (
                  <>
                    <span className="text-[#CBD5E1] dark:text-[#334155]">·</span>
                    <span>
                      Specification:{' '}
                      <a
                        href={TOOL_EDITORIAL_LINKS[tool.id].externalLinks[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 font-semibold text-[#7047EB] dark:text-[#A78BFA] underline decoration-[#7047EB]/40 hover:decoration-[#7047EB] underline-offset-2"
                      >
                        <span>{TOOL_EDITORIAL_LINKS[tool.id].externalLinks[0].keywordAnchor}</span>
                        <ExternalLink className="w-3 h-3 inline shrink-0" aria-hidden="true" />
                      </a>
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tool-specific processing information & Pin to Favorites */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(tool.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isFavorite
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                  : 'bg-white dark:bg-[#1C1F2E] border-[#E8E6F2] dark:border-[#2A2E42] text-[#253044] dark:text-[#CBD5E1] hover:border-amber-400'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>{isFavorite ? 'Pinned' : 'Pin Tool'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowZeroUploadVerify(!showZeroUploadVerify)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:border-emerald-500 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Processing details</span>
          </button>
          {aiAssistantEnabled && (
<button
            type="button"
            onClick={() => onOpenAiModal(outputText || inputText)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F4E5FF] dark:bg-[#7047EB]/20 text-[#7E22CE] dark:text-[#C4B5FD] text-xs font-semibold hover:bg-[#EDE7FF] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Grounded Inspect</span>
          </button>
            )}
        </div>
      </div>

      {showZeroUploadVerify && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div>
              <strong>Processing model for {tool.name}:</strong> {tool.specTable.privacyModel}. For tools marked as local, the input is processed in your browser rather than sent to our processing servers. You can inspect network activity in Browser DevTools; distinguish analytics requests from transfers of tool inputs.
            </div>
            <div className="text-[11px] opacity-85">
              This describes file and text processing, not all website network activity. The embedded Google Tag Manager container may load analytics or other tags; the actual tags and events depend on its external account configuration. AI or remote-service features, where enabled, may send submitted text to the relevant provider. The current static Cloudflare deployment disables server-backed AI features. Do not submit passwords, access tokens, or private keys.
            </div>
          </div>
          <span className="font-mono font-bold whitespace-nowrap shrink-0">Tool-Specific Processing</span>
        </div>
      )}

      {chainedFromLabel && (
        <div className="mb-6 p-3.5 rounded-2xl bg-[#EDE7FF] dark:bg-[#7047EB]/20 border border-[#C7B8F9] dark:border-[#4C3D99] text-xs text-[#171927] dark:text-[#F8F7FC] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#7047EB] shrink-0" />
            <span>
              <strong>1-Click Pipeline Active:</strong> Output from <strong>{chainedFromLabel}</strong> was piped directly into <strong>{tool.name}</strong> with zero re-uploading.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setChainedFromLabel(null)}
            className="text-xs font-semibold text-[#7047EB] hover:underline shrink-0 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* =====================================================================
          ZONE 3: The Interactive Tool Workspace (Matched 1:1 to Reference Image)
      ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (8 Cols): Dropzone / Input Editor + Output Queue */}
        <div className="lg:col-span-8 space-y-5">
          {/* Mandatory UX Upgrades Action Bar (Load Sample Data, Paste, Copy, ZIP, Clear) */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-[#1C1F2E] px-4 py-2.5 rounded-2xl border border-[#E8E6F2] dark:border-[#2A2E42]">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleLoadSampleData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EDE7FF] dark:bg-[#7047EB]/25 text-[#7047EB] dark:text-[#C4B5FD] text-xs font-semibold hover:bg-[#DDD6FE] transition-colors whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Sample Data</span>
              </button>

              {!isBinaryFileTool && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const clip = await navigator.clipboard.readText();
                      if (clip) setInputText(clip);
                    } catch {
                      // Clipboard permission fallback
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] text-xs font-semibold text-[#253044] dark:text-[#E2E8F0] hover:border-[#7047EB] transition-colors whitespace-nowrap shrink-0"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span>Paste</span>
                </button>
              )}

              {tool.id === 'json-formatter-validator' && (
                <button
                  type="button"
                  onClick={() => runReactiveTextEngine(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-xs font-semibold hover:bg-amber-200 transition-colors whitespace-nowrap shrink-0"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Auto-Fix Broken JSON</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!isBinaryFileTool && (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(outputText);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1800);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] text-xs font-semibold text-[#171927] dark:text-[#F8F7FC] hover:border-[#7047EB] transition-colors whitespace-nowrap shrink-0"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-[#7047EB]" />
                  )}
                  <span>{copied ? 'Copied!' : 'Copy Output'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleDownloadAllZip}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] text-xs font-semibold text-[#7047EB] hover:bg-[#F8F7FC] dark:hover:bg-[#252A3F] transition-colors whitespace-nowrap shrink-0"
              >
                <FileArchive className="w-3.5 h-3.5" />
                <span>Download as ZIP</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setInputText('');
                  setOutputText('');
                  setUploadedFiles([]);
                  setProcessedItems([]);
                  setForensicTable(null);
                }}
                aria-label="Clear workspace"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#64748B] hover:text-red-600 transition-colors whitespace-nowrap shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Primary Dropzone or Interactive Code/Text Workspace */}
          {isBinaryFileTool ? (
            <div className="rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] p-6 space-y-5">
              {/* Dashed Dropzone matching Screenshot Panel 3 */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-2xl border-2 border-dashed border-[#C7B8F9] dark:border-[#4C3D99] bg-[#F8F7FC]/90 dark:bg-[#151824] hover:border-[#7047EB] transition-all py-12 px-6 flex flex-col items-center justify-center text-center min-h-[250px]"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={tool.hubId === 'pdf-tools' && tool.id !== 'image-to-pdf' ? '.pdf,application/pdf' : 'image/*'}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-[#EDE7FF] dark:bg-[#7047EB]/20 text-[#7047EB] flex items-center justify-center mb-4">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <p className="text-base font-bold text-[#171927] dark:text-[#F8F7FC]">
                  Drop your {tool.hubId === 'pdf-tools' && tool.id !== 'image-to-pdf' ? 'PDF files' : 'images'} here
                </p>
                <p className="text-xs text-[#64748B] mt-1 mb-4">or click to browse files</p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#7047EB] hover:bg-[#5E35D9] text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  Select {tool.hubId === 'pdf-tools' && tool.id !== 'image-to-pdf' ? 'PDF Files' : 'Images'}
                </button>
                <p className="text-xs text-[#64748B] mt-4">
                  {tool.specTable.supportedFormats} · Batch capacity depends on file size and available browser memory
                </p>
              </div>

              {/* Queued Input Files Manager (Reorder & Individual Remove) */}
              {uploadedFiles.length > 0 && (
                <div className="rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] bg-[#F8F7FC] dark:bg-[#151824] p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-[#171927] dark:text-[#F8F7FC] tabular-nums">
                      Queued Input Files ({uploadedFiles.length})
                    </span>
                    <span className="text-[#64748B]">
                      {uploadedFiles.length > 1
                        ? 'Use arrows to set order before processing'
                        : 'Processed locally in browser RAM'}
                    </span>
                  </div>
                  <ul className="divide-y divide-[#E8E6F2] dark:divide-[#2A2E42] rounded-lg border border-[#E8E6F2] dark:border-[#2A2E42] bg-white dark:bg-[#1C1F2E]">
                    {uploadedFiles.map((file, idx) => (
                      <li
                        key={`${file.name}-${file.size}-${idx}`}
                        className="px-3 py-2 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-[#7047EB] w-5 shrink-0 tabular-nums">
                            {idx + 1}.
                          </span>
                          <span className="font-semibold text-[#171927] dark:text-[#F8F7FC] truncate">
                            {file.name}
                          </span>
                          <span className="text-[#64748B] font-mono text-[11px] shrink-0 tabular-nums">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {uploadedFiles.length > 1 && (
                            <>
                              <button
                                type="button"
                                onClick={() => moveQueuedFile(idx, -1)}
                                disabled={idx === 0}
                                aria-label={`Move ${file.name} up`}
                                className="p-1 rounded border border-[#E8E6F2] dark:border-[#2A2E42] text-[#64748B] hover:text-[#7047EB] disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
                              >
                                <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveQueuedFile(idx, 1)}
                                disabled={idx === uploadedFiles.length - 1}
                                aria-label={`Move ${file.name} down`}
                                className="p-1 rounded border border-[#E8E6F2] dark:border-[#2A2E42] text-[#64748B] hover:text-[#7047EB] disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
                              >
                                <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => removeQueuedFile(idx)}
                            aria-label={`Remove ${file.name}`}
                            className="p-1 rounded border border-[#E8E6F2] dark:border-[#2A2E42] text-[#64748B] hover:text-red-600 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Forensic Metadata / EXIF Table (if present) */}
              {forensicTable && (
                <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/60 dark:bg-amber-950/20 p-4 space-y-2">
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-300">
                    Forensic Metadata & Tracking Tags Detected (Automatically Stripped in Output):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {Object.entries(forensicTable).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-center justify-between gap-2 bg-white dark:bg-[#151824] px-3 py-1.5 rounded-lg border border-amber-200/60 dark:border-amber-800/40"
                      >
                        <span className="font-semibold text-[#64748B]">{k}:</span>
                        <span className="font-mono text-[#171927] dark:text-[#E2E8F0] truncate max-w-[200px]">
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Honest feature-availability notice (aria-live so screen readers hear it) */}
              {processingNotice && (
                <div
                  role="status"
                  aria-live="polite"
                  className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-1"
                >
                  <div className="font-bold">Not available yet — nothing was faked</div>
                  <p className="leading-relaxed">{processingNotice}</p>
                </div>
              )}

              {/* Processed Batch Queue Results */}
              {isProcessing && (
                <div
                  className="ngt-card p-4 space-y-3"
                  role="status"
                  aria-live="polite"
                  aria-label="Processing files"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-[#7047EB] dark:text-[#A78BFA] flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 animate-spin" aria-hidden="true" />
                      Working inside your browser — nothing is uploaded
                    </span>
                    {cancelAvailable && (
                      <button
                        type="button"
                        onClick={() => {
                          cancelRequestedRef.current = true;
                          setProcessingNotice('Cancelling — finishing the file already in progress…');
                        }}
                        className="ngt-btn ngt-btn-ghost px-3 py-1.5 text-xs"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  <div className="space-y-2" aria-hidden="true">
                    <div className="ngt-skeleton h-2.5 w-11/12" />
                    <div className="ngt-skeleton h-2.5 w-8/12" />
                  </div>
                </div>
              )}

              {processedItems.length > 0 && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="text-sm font-bold text-[#171927] dark:text-white">
                      Results
                      <span className="ml-2 font-medium text-[#5B6A80] dark:text-[#94A3B8] tabular-nums">
                        {processedItems.length} file{processedItems.length === 1 ? '' : 's'}
                      </span>
                    </h2>
                    <span className="text-xs text-[#5B6A80] dark:text-[#94A3B8] tabular-nums">
                      {(processedItems.reduce((acc, item) => acc + item.outputSize, 0) / 1024).toFixed(1)} KB total
                    </span>
                  </div>
                  {gauge && <ByteGauge {...gauge} />}
                  {/* Local Execution Speed & Savings Receipt */}
                  {(() => {
                    const totalOrig = processedItems.reduce((acc, i) => acc + i.originalSize, 0);
                    const totalOut = processedItems.reduce((acc, i) => acc + i.outputSize, 0);
                    const totalSavedKb = Math.max(0, (totalOrig - totalOut) / 1024);
                    const totalSavedPct =
                      totalOrig > totalOut ? Math.round(((totalOrig - totalOut) / totalOrig) * 100) : 0;
                    return (
                      <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex flex-wrap items-center gap-2 text-emerald-900 dark:text-emerald-200 font-medium tabular-nums">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>
                            Processed locally in <strong>{executionDurationMs === null ? '—' : `${executionDurationMs} ms`}</strong>
                          </span>
                          <span>·</span>
                          <span>No File Upload to Processing Server</span>
                          {totalSavedPct > 0 && (
                            <>
                              <span>·</span>
                              <span className="font-bold text-emerald-700 dark:text-emerald-300">
                                Saved {totalSavedPct}% ({totalSavedKb.toFixed(1)} KB reduced)
                              </span>
                            </>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleDownloadAllZip}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7047EB] hover:bg-[#5E35D9] text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <FileArchive className="w-3.5 h-3.5" />
                          <span>Download All as ZIP</span>
                        </button>
                      </div>
                    );
                  })()}

                  <div className="divide-y divide-[#E8E6F2] dark:divide-[#2A2E42] rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] overflow-hidden">
                    {processedItems.map((item) => {
                      const savedPct =
                        item.originalSize > item.outputSize
                          ? Math.round(((item.originalSize - item.outputSize) / item.originalSize) * 100)
                          : 0;
                      return (
                        <div
                          key={item.id}
                          className="p-3.5 bg-white dark:bg-[#151824] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {item.previewUrl ? (
                              <img
                                src={item.previewUrl}
                                alt={item.name}
                                referrerPolicy="no-referrer"
                                className="w-12 h-12 rounded-lg object-cover border border-[#E8E6F2] dark:border-[#2A2E42] shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-[#FFE7EC] text-[#E11D48] flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-bold text-[#171927] dark:text-[#F8F7FC] truncate">
                                {item.name}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B] tabular-nums mt-0.5">
                                <span>{(item.originalSize / 1024).toFixed(1)} KB</span>
                                <span>→</span>
                                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                  {(item.outputSize / 1024).toFixed(1)} KB
                                </span>
                                {savedPct > 0 && (
                                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                                    (-{savedPct}%)
                                  </span>
                                )}
                                {item.metaSummary &&
                                  Object.entries(item.metaSummary).map(([k, v]) => (
                                    <span key={k}>
                                      · {k}: {v}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                            {item.sourcePreviewUrl && item.previewUrl && (
                              <button
                                type="button"
                                onClick={() => setCompareItem(item)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] bg-[#F8F7FC] dark:bg-[#1C1F2E] hover:border-[#7047EB] text-[#171927] dark:text-[#F8F7FC] text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                              >
                                <Columns2 className="w-3.5 h-3.5 text-[#7047EB]" aria-hidden="true" />
                                <span>Compare</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDownloadSingleItem(item)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#7047EB] hover:bg-[#5E35D9] text-white text-xs font-semibold shrink-0 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 1-Click Tool Chaining Pipeline for Binary Files */}
                  {onChainToTool && (
                    <div className="p-4 rounded-xl bg-[#F8F7FC] dark:bg-[#151824] border border-[#E8E6F2] dark:border-[#2A2E42] space-y-2.5">
                      <div className="text-xs font-bold text-[#171927] dark:text-[#F8F7FC] flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-[#7047EB]" />
                        <span>Continue Workflow · Send Output Directly to Next Tool (No Re-Upload):</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(processedItems[0]?.mimeType === 'application/pdf'
                          ? [
                              { id: 'compress-pdf', label: 'Compress PDF to Exact KB' },
                              { id: 'pdf-metadata-cleaner', label: 'Strip PDF Metadata' },
                              { id: 'split-pdf', label: 'Split / Extract Pages' },
                              { id: 'pdf-to-image', label: 'Render PDF to Images' },
                            ]
                          : [
                              { id: 'image-to-pdf', label: 'Compile Images into PDF' },
                              { id: 'compress-image-to-kb', label: 'Compress to Exact KB' },
                              { id: 'exif-metadata-remover', label: 'Strip GPS & EXIF Tags' },
                              { id: 'bulk-webp-avif-converter', label: 'Convert Format (WebP/PNG)' },
                            ]
                        )
                          .filter((next) => next.id !== tool.id)
                          .map((next) => (
                            <button
                              key={next.id}
                              type="button"
                              onClick={() => {
                                const chainedFiles = processedItems.map(
                                  (item) => new File([item.blob], item.name, { type: item.mimeType })
                                );
                                onChainToTool(next.id, {
                                  files: chainedFiles,
                                  fromToolName: tool.name,
                                });
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] hover:border-[#7047EB] text-xs font-semibold text-[#253044] dark:text-[#CBD5E1] hover:text-[#7047EB] transition-colors cursor-pointer"
                            >
                              <span>{next.label}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-[#7047EB]" />
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Dev / Text / Generator / OCR Interactive Split Editor */
            <div className="rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] p-5 space-y-4">
              {jsonErrorInfo && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-red-700 dark:text-red-300">
                  <span className="font-mono">{jsonErrorInfo}</span>
                  <button
                    type="button"
                    onClick={() => runReactiveTextEngine(true)}
                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-semibold shrink-0"
                  >
                    1-Click Auto-Fix JSON
                  </button>
                </div>
              )}

              {jsonRepairedBanner && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                  Auto-Fix Applied: Repaired broken JSON syntax (stripped trailing commas, normalized single quotes, and quoted keys).
                </div>
              )}

              {/* OCR Screenshot Paste Dropzone if tool === image-to-text-ocr */}
              {tool.id === 'image-to-text-ocr' && (
                <div
                  onPaste={async (e) => {
                    const items = e.clipboardData?.items;
                    if (!items) return;
                    for (let i = 0; i < items.length; i++) {
                      if (items[i].type.startsWith('image/')) {
                        const f = items[i].getAsFile();
                        if (f) {
                          setUploadedFiles([f]);
                          // The OCR engine is not shipped. Never invent recognised
                          // text here: say what actually happened instead.
                          setInputText('');
                          setProcessingNotice(
                            'OCR is not available yet. The image was attached, but no text was extracted — nothing here is guesswork.'
                          );
                        }
                      }
                    }
                  }}
                  className="p-4 rounded-xl border-2 border-dashed border-[#C7B8F9] dark:border-[#4C3D99] bg-[#F8F7FC] dark:bg-[#151824] text-center text-xs text-[#64748B]"
                >
                  Press <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#1C1F2E] border font-mono">Ctrl+V</kbd> anywhere to paste a screenshot directly from your clipboard, or edit the recognized OCR text below.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor={`ngt-input-${tool.id}`} className="block text-xs font-bold text-[#171927] dark:text-[#F8F7FC]">
                    {tool.id === 'code-diff-checker' ? 'Original Text / Code (A)' : 'Input Source'}
                  </label>
                  <textarea
                    id={`ngt-input-${tool.id}`}
                    rows={12}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type, paste, or click Load Sample Data..."
                    className="w-full rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] bg-[#F8F7FC] dark:bg-[#151824] p-3.5 font-mono text-xs text-[#171927] dark:text-[#E2E8F0] focus:outline-none focus:border-[#7047EB] leading-relaxed"
                  />
                </div>

                {tool.id === 'code-diff-checker' ? (
                  <div className="space-y-1.5">
                    <label htmlFor="ngt-secondary-input" className="block text-xs font-bold text-[#171927] dark:text-[#F8F7FC]">
                      Modified Text / Code (B)
                    </label>
                    <textarea
                      id="ngt-secondary-input"
                      rows={12}
                      value={secondaryText}
                      onChange={(e) => setSecondaryText(e.target.value)}
                      className="w-full rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] bg-[#F8F7FC] dark:bg-[#151824] p-3.5 font-mono text-xs text-[#171927] dark:text-[#E2E8F0] focus:outline-none focus:border-[#7047EB] leading-relaxed"
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor={`ngt-output-${tool.id}`} className="block text-xs font-bold text-[#171927] dark:text-[#F8F7FC]">
                        Live Reactive Output (0ms Reload)
                      </label>
                      {tool.id === 'text-to-txt-markdown' && (
                        <span className="text-xs text-emerald-700 dark:text-emerald-400 font-mono">
                          Removed {watermarkStats.zw} zero-width & {watermarkStats.nbsp} NBSP chars
                        </span>
                      )}
                    </div>
                    <textarea
                      id={`ngt-output-${tool.id}`}
                      rows={12}
                      readOnly
                      aria-live="polite"
                      aria-label={`${tool.name} output`}
                      value={outputText}
                      onChange={(e) => setOutputText(e.target.value)}
                      className="w-full rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] bg-[#131520] text-[#E2E8F0] p-3.5 font-mono text-xs focus:outline-none leading-relaxed"
                    />
                  </div>
                )}
              </div>

              {/* Diff Output Panel when tool is code-diff-checker */}
              {tool.id === 'code-diff-checker' && (
                <div className="space-y-1.5 pt-2">
                  <label className="block text-xs font-bold text-[#171927] dark:text-[#F8F7FC]">
                    Unified Myers Diff & Git .patch Output
                  </label>
                  <pre
                    aria-live="polite"
                    aria-label="Diff output"
                    className="w-full rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] bg-[#131520] text-[#E2E8F0] p-4 font-mono text-xs overflow-x-auto max-h-64 whitespace-pre-wrap"
                  >
                    {outputText}
                  </pre>
                </div>
              )}

              {/* QR Studio Live Vector Preview */}
              {tool.id === 'custom-qr-code-generator' && qrOutput && (
                <div className="p-4 rounded-xl bg-[#F8F7FC] dark:bg-[#151824] border border-[#E8E6F2] dark:border-[#2A2E42] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={qrOutput.pngDataUrl}
                      alt="Generated Static QR Code"
                      referrerPolicy="no-referrer"
                      className="w-32 h-32 rounded-xl border border-[#E8E6F2] bg-white p-2"
                    />
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-[#171927] dark:text-[#F8F7FC]">
                        100% Permanent Static QR Code (Never Expires)
                      </div>
                      <p className="text-xs text-[#64748B]">
                        Reed-Solomon Error Correction Level {qrEcc} · ISO/IEC 18004 Vector SVG & 600px PNG
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => handleDownloadTextOutput('svg')}
                          className="px-3 py-1.5 rounded-lg bg-[#7047EB] text-white text-xs font-semibold"
                        >
                          Download Vector .SVG
                        </button>
                        <a
                          href={qrOutput.pngDataUrl}
                          download="nextgentoolkit-qrcode-600px.png"
                          className="px-3 py-1.5 rounded-lg border border-[#E8E6F2] dark:border-[#2A2E42] bg-white dark:bg-[#1C1F2E] text-xs font-semibold text-[#171927] dark:text-[#F8F7FC]"
                        >
                          Download High-Res .PNG
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* LLM Multi-Model Token & Pricing Matrix Table */}
              {tool.id === 'llm-token-counter' && tokenStats && (
                <div className="pt-2 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-[#F8F7FC] dark:bg-[#151824] border border-[#E8E6F2] dark:border-[#2A2E42]">
                      <div className="text-xs text-[#64748B]">Estimated BPE Tokens</div>
                      <div className="text-lg font-extrabold text-[#7047EB] font-mono tabular-nums">
                        {tokenStats.tokens.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F8F7FC] dark:bg-[#151824] border border-[#E8E6F2] dark:border-[#2A2E42]">
                      <div className="text-xs text-[#64748B]">Words</div>
                      <div className="text-lg font-extrabold text-[#171927] dark:text-[#F8F7FC] font-mono tabular-nums">
                        {tokenStats.words.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F8F7FC] dark:bg-[#151824] border border-[#E8E6F2] dark:border-[#2A2E42]">
                      <div className="text-xs text-[#64748B]">Characters</div>
                      <div className="text-lg font-extrabold text-[#171927] dark:text-[#F8F7FC] font-mono tabular-nums">
                        {tokenStats.chars.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F8F7FC] dark:bg-[#151824] border border-[#E8E6F2] dark:border-[#2A2E42]">
                      <div className="text-xs text-[#64748B]">Lines</div>
                      <div className="text-lg font-extrabold text-[#171927] dark:text-[#F8F7FC] font-mono tabular-nums">
                        {tokenStats.lines.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42]">
                    <table className="w-full text-left text-xs border-collapse tabular-nums">
                      <thead className="bg-[#F8F7FC] dark:bg-[#151824] text-[#64748B]">
                        <tr>
                          <th className="py-2.5 px-3 font-semibold">LLM Model & Tokenizer</th>
                          <th className="py-2.5 px-3 font-semibold">Tokens</th>
                          <th className="py-2.5 px-3 font-semibold">Input Cost</th>
                          <th className="py-2.5 px-3 font-semibold">Output Cost</th>
                          <th className="py-2.5 px-3 font-semibold">Context Window</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8E6F2] dark:divide-[#2A2E42]">
                        {tokenStats.models.map((m) => (
                          <tr key={m.id}>
                            <td className="py-2.5 px-3 font-semibold text-[#171927] dark:text-[#F8F7FC]">
                              {m.name}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[#7047EB] font-bold">
                              {m.estimatedTokens.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 font-mono">${m.inputCostUsd.toFixed(6)}</td>
                            <td className="py-2.5 px-3 font-mono">${m.outputCostUsd.toFixed(6)}</td>
                            <td className="py-2.5 px-3 font-mono text-[#64748B]">
                              {(m.contextWindow / 1000).toFixed(0)}K
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 1-Click Tool Chaining Pipeline for Text / Developer / Generator Tools */}
              {onChainToTool && outputText.trim().length > 0 && (
                <div className="p-3.5 rounded-xl bg-[#F8F7FC] dark:bg-[#151824] border border-[#E8E6F2] dark:border-[#2A2E42] space-y-2">
                  <div className="text-xs font-bold text-[#171927] dark:text-[#F8F7FC] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#7047EB]" />
                    <span>Continue Workflow · Pipe Output Text Directly to Next Tool:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'llm-token-counter', label: 'Count LLM Tokens & API Cost' },
                      { id: 'word-counter-density', label: 'Analyze SEO Word Density' },
                      { id: 'base64-url-encoder', label: 'Encode to Base64 / URL' },
                      { id: 'custom-qr-code-generator', label: 'Generate Vector QR Code' },
                    ]
                      .filter((next) => next.id !== tool.id)
                      .map((next) => (
                        <button
                          key={next.id}
                          type="button"
                          onClick={() =>
                            onChainToTool(next.id, {
                              text: outputText,
                              fromToolName: tool.name,
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] hover:border-[#7047EB] text-xs font-semibold text-[#253044] dark:text-[#CBD5E1] hover:text-[#7047EB] transition-colors cursor-pointer"
                        >
                          <span>{next.label}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#7047EB]" />
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (4 Cols): Tool Settings Card + Primary Action Button + Privacy Card */}
        <div className="lg:col-span-4 space-y-5">
          <div className="rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] p-5 space-y-5">
            <h2 className="text-sm font-bold text-[#171927] dark:text-[#F8F7FC]">
              {tool.name} Settings
            </h2>

            {/* Contextual Controls based on Active Tool */}
            {(tool.id === 'compress-image-to-kb' || tool.id === 'compress-pdf') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#171927] dark:text-[#F8F7FC]">
                    Target Portal Limit: {targetKb} KB
                  </span>
                  <span className="font-mono text-[#7047EB] font-bold">≤ {targetKb} KB</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={500}
                  step={10}
                  value={targetKb}
                  onChange={(e) => setTargetKb(Number(e.target.value))}
                  className="w-full ngt-slider"
                />
                <div className="text-[11px] font-semibold text-[#64748B]">
                  1-Click Portal &amp; Form Presets:
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { kb: 20, label: '20 KB · Exam Sign' },
                    { kb: 50, label: '50 KB · Passport/Visa' },
                    { kb: 100, label: '100 KB · Gov Portal' },
                    { kb: 200, label: '200 KB · Official PDF' },
                    { kb: 500, label: '500 KB · High-Res' },
                  ].map((preset) => (
                    <button
                      key={preset.kb}
                      type="button"
                      onClick={() => setTargetKb(preset.kb)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors text-left truncate cursor-pointer ${
                        targetKb === preset.kb
                          ? 'bg-[#7047EB] text-white border-[#7047EB]'
                          : 'border-[#E8E6F2] dark:border-[#2A2E42] text-[#64748B] hover:border-[#7047EB]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tool.hubId === 'image-tools' && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#171927] dark:text-[#F8F7FC]">
                      Quality: {qualitySlider}%
                    </span>
                    <span className="font-mono text-[#64748B]">{qualitySlider}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={qualitySlider}
                    onChange={(e) => setQualitySlider(Number(e.target.value))}
                    className="w-full ngt-slider"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#171927] dark:text-[#F8F7FC]">
                    Output Format
                  </label>
                  <select
                    value={imageOutputFormat}
                    onChange={(e) =>
                      setImageOutputFormat(e.target.value as 'image/webp' | 'image/jpeg' | 'image/png')
                    }
                    className="w-full rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] bg-[#F8F7FC] dark:bg-[#151824] px-3 py-2 text-xs font-medium text-[#171927] dark:text-[#F8F7FC] focus:outline-none focus:border-[#7047EB]"
                  >
                    <option value="image/webp">Next-Gen WebP (Recommended)</option>
                    <option value="image/jpeg">Same as original / JPEG (.jpg)</option>
                    <option value="image/png">Lossless PNG (.png)</option>
                  </select>
                </div>
              </>
            )}

            {tool.id === 'merge-pdf' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#171927] dark:text-[#F8F7FC]">
                  Normalize Page Rotation
                </label>
                <select
                  value={pdfRotation}
                  onChange={(e) => setPdfRotation(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] bg-[#F8F7FC] dark:bg-[#151824] px-3 py-2 text-xs font-medium text-[#171927] dark:text-[#F8F7FC]"
                >
                  <option value={0}>0° (Keep Original Orientation)</option>
                  <option value={90}>Rotate 90° Clockwise</option>
                  <option value={180}>Rotate 180° Upside Down</option>
                  <option value={270}>Rotate 270° Counter-Clockwise</option>
                </select>
              </div>
            )}

            {tool.id === 'split-pdf' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#171927] dark:text-[#F8F7FC]">
                  Custom Page Range Syntax
                </label>
                <input
                  type="text"
                  value={pdfRangeSyntax}
                  onChange={(e) => setPdfRangeSyntax(e.target.value)}
                  placeholder="e.g. 1-3, 5, 8-10"
                  className="w-full rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] bg-[#F8F7FC] dark:bg-[#151824] px-3 py-2 text-xs font-mono text-[#171927] dark:text-[#F8F7FC]"
                />
              </div>
            )}

            {tool.id === 'pdf-to-image' && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <span className="block text-xs font-semibold text-[#171927] dark:text-[#F8F7FC]">
                    Render resolution
                  </span>
                  <div className="grid grid-cols-3 gap-2" role="group" aria-label="Render resolution">
                    {([150, 300, 600] as const).map((dpi) => (
                      <button
                        key={dpi}
                        type="button"
                        aria-pressed={pdfDpi === dpi}
                        onClick={() => setPdfDpi(dpi)}
                        className={`min-h-11 py-2 rounded-xl text-xs font-mono font-semibold border ${
                          pdfDpi === dpi
                            ? 'bg-[#7047EB] text-white border-[#7047EB]'
                            : 'border-[#E8E6F2] dark:border-[#2A2E42] text-[#64748B]'
                        }`}
                      >
                        {dpi} DPI
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    Very high resolutions are lowered automatically on small devices; the result
                    panel reports the DPI that was actually used.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="ngt-pdf-page-range"
                    className="block text-xs font-semibold text-[#171927] dark:text-[#F8F7FC]"
                  >
                    Pages (all, or 1-3, 5)
                  </label>
                  <input
                    id="ngt-pdf-page-range"
                    type="text"
                    inputMode="text"
                    value={pdfImagePages}
                    onChange={(e) => setPdfImagePages(e.target.value)}
                    placeholder="all"
                    className="w-full rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] bg-[#F8F7FC] dark:bg-[#151824] px-3 py-2 min-h-11 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="ngt-pdf-image-format"
                    className="block text-xs font-semibold text-[#171927] dark:text-[#F8F7FC]"
                  >
                    Image format
                  </label>
                  <select
                    id="ngt-pdf-image-format"
                    value={imageOutputFormat}
                    onChange={(e) =>
                      setImageOutputFormat(e.target.value as 'image/webp' | 'image/jpeg' | 'image/png')
                    }
                    className="w-full rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] bg-[#F8F7FC] dark:bg-[#151824] px-3 py-2 min-h-11 text-xs font-medium"
                  >
                    <option value="image/png">PNG (lossless)</option>
                    <option value="image/jpeg">JPEG</option>
                    <option value="image/webp">WebP</option>
                  </select>
                </div>
              </div>
            )}

            {tool.id === 'image-to-pdf' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#171927] dark:text-[#F8F7FC] mb-1">
                    Container Page Size
                  </label>
                  <select
                    value={pdfPageSize}
                    onChange={(e) => setPdfPageSize(e.target.value as 'A4' | 'Letter' | 'Fit')}
                    className="w-full rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] bg-[#F8F7FC] dark:bg-[#151824] px-3 py-2 text-xs font-medium"
                  >
                    <option value="A4">ISO A4 (210 × 297 mm)</option>
                    <option value="Letter">US Letter (8.5 × 11 in)</option>
                    <option value="Fit">Auto-Fit to Image Dimensions</option>
                  </select>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#171927] dark:text-[#F8F7FC]">
                    Orientation
                  </span>
                  <div className="flex gap-1">
                    {(['portrait', 'landscape'] as const).map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => setPdfOrientation(o)}
                        className={`px-2.5 py-1 rounded-lg capitalize font-semibold ${
                          pdfOrientation === o ? 'bg-[#7047EB] text-white' : 'text-[#64748B]'
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pdfStampNumbers}
                    onChange={(e) => setPdfStampNumbers(e.target.checked)}
                    className="rounded text-[#7047EB]"
                  />
                  <span>Stamp "Page X of Y" Footer</span>
                </label>
              </div>
            )}

            {tool.id === 'json-formatter-validator' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#171927] dark:text-[#F8F7FC] mb-1.5">
                    Convert Output Target
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(
                      [
                        { id: 'json', label: 'JSON' },
                        { id: 'csv', label: 'CSV' },
                        { id: 'yaml', label: 'YAML' },
                        { id: 'ts', label: 'TypeScript' },
                        { id: 'sql', label: 'SQL Table' },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setJsonFormatTab(t.id)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold border ${
                          jsonFormatTab === t.id
                            ? 'bg-[#7047EB] text-white border-[#7047EB]'
                            : 'border-[#E8E6F2] dark:border-[#2A2E42] text-[#64748B]'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171927] dark:text-[#F8F7FC] mb-1">
                    Indentation Level
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { n: 2, label: '2 Spaces' },
                      { n: 4, label: '4 Spaces' },
                      { n: 0, label: 'Minify' },
                    ].map((ind) => (
                      <button
                        key={ind.n}
                        type="button"
                        onClick={() => setJsonIndent(ind.n)}
                        className={`py-1.5 rounded-lg text-xs font-semibold border ${
                          jsonIndent === ind.n
                            ? 'bg-[#7047EB] text-white border-[#7047EB]'
                            : 'border-[#E8E6F2] dark:border-[#2A2E42] text-[#64748B]'
                        }`}
                      >
                        {ind.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tool.id === 'llm-token-counter' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#171927] dark:text-[#F8F7FC] mb-1">
                    Context Packer Format (Repomix Style)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['xml', 'markdown'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setLlmPackFormat(fmt)}
                        className={`py-2 rounded-xl text-xs font-semibold uppercase border ${
                          llmPackFormat === fmt
                            ? 'bg-[#7047EB] text-white border-[#7047EB]'
                            : 'border-[#E8E6F2] dark:border-[#2A2E42] text-[#64748B]'
                        }`}
                      >
                        {fmt} Tags
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={llmStripComments}
                    onChange={(e) => setLlmStripComments(e.target.checked)}
                  />
                  <span>Strip Comments & Empty Lines (-20% tokens)</span>
                </label>
              </div>
            )}

            {tool.id === 'regex-tester' && (
              <div className="space-y-3">
                <div>
                  <label htmlFor="ngt-regex-pattern" className="block text-xs font-semibold text-[#171927] dark:text-[#F8F7FC] mb-1">
                    Regular Expression Pattern
                  </label>
                  <input
                    id="ngt-regex-pattern"
                    type="text"
                    value={regexPattern}
                    onChange={(e) => setRegexPattern(e.target.value)}
                    className="w-full rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] bg-[#F8F7FC] dark:bg-[#151824] px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#171927] dark:text-[#F8F7FC] mb-1">
                    1-Click Regex Presets
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'Email', re: '([a-zA-Z0-9._+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})' },
                      { label: 'IPv4', re: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b' },
                      { label: 'ISO Date', re: '\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z' },
                      { label: 'Order ID', re: '#NGT-(\\d+)' },
                    ].map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setRegexPattern(p.re)}
                        className="px-2.5 py-1 rounded-lg border border-[#E8E6F2] dark:border-[#2A2E42] text-xs font-semibold hover:border-[#7047EB]"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#171927] dark:text-[#F8F7FC] mb-1">
                    Code Generator Target
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['js', 'python', 'go'] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setRegexLangTab(lang)}
                        className={`py-1.5 rounded-lg text-xs font-semibold uppercase border ${
                          regexLangTab === lang
                            ? 'bg-[#7047EB] text-white border-[#7047EB]'
                            : 'border-[#E8E6F2] dark:border-[#2A2E42] text-[#64748B]'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tool.id === 'code-diff-checker' && (
              <div className="space-y-2.5 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={diffIgnoreWhitespace}
                    onChange={(e) => setDiffIgnoreWhitespace(e.target.checked)}
                  />
                  <span>Ignore Whitespace Differences</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={diffIgnoreCase}
                    onChange={(e) => setDiffIgnoreCase(e.target.checked)}
                  />
                  <span>Ignore Uppercase / Lowercase</span>
                </label>
              </div>
            )}

            {tool.id === 'base64-url-encoder' && (
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    { id: 'base64-encode', label: 'Base64 Encode' },
                    { id: 'base64-decode', label: 'Base64 Decode' },
                    { id: 'url-encode', label: 'URL Encode' },
                    { id: 'url-decode', label: 'URL Decode' },
                    { id: 'html-encode', label: 'HTML Entities' },
                    { id: 'html-decode', label: 'HTML Decode' },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setCodecMode(m.id)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border ${
                      codecMode === m.id
                        ? 'bg-[#7047EB] text-white border-[#7047EB]'
                        : 'border-[#E8E6F2] dark:border-[#2A2E42] text-[#64748B]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            )}

            {tool.id === 'text-to-txt-markdown' && (
              <div className="space-y-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stripMarkdownToggle}
                    onChange={(e) => setStripMarkdownToggle(e.target.checked)}
                  />
                  <span>Strip Markdown Symbols (**bold**, # headers)</span>
                </label>
                <div>
                  <span className="block font-semibold mb-1">Line Ending Format</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(['LF', 'CRLF'] as const).map((le) => (
                      <button
                        key={le}
                        type="button"
                        onClick={() => setLineEndingMode(le)}
                        className={`py-1.5 rounded-lg font-mono font-semibold border ${
                          lineEndingMode === le
                            ? 'bg-[#7047EB] text-white border-[#7047EB]'
                            : 'border-[#E8E6F2] dark:border-[#2A2E42] text-[#64748B]'
                        }`}
                      >
                        {le} ({le === 'LF' ? 'Unix/Mac' : 'Windows'})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tool.id === 'duplicate-line-remover' && (
              <div className="space-y-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dedupCaseSensitive}
                    onChange={(e) => setDedupCaseSensitive(e.target.checked)}
                  />
                  <span>Case-Sensitive Deduplication</span>
                </label>
                <div>
                  <label className="block font-semibold mb-1">Sort Unique Lines</label>
                  <select
                    value={dedupSortMode}
                    onChange={(e) =>
                      setDedupSortMode(e.target.value as 'none' | 'asc' | 'desc' | 'length')
                    }
                    className="w-full rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] bg-[#F8F7FC] dark:bg-[#151824] px-3 py-2"
                  >
                    <option value="asc">Natural Alphanumeric (A → Z)</option>
                    <option value="desc">Reverse Alphanumeric (Z → A)</option>
                    <option value="length">By Line Length (Shortest First)</option>
                    <option value="none">Preserve Original Order</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#64748B] mb-1">Line Prefix</label>
                    <input
                      type="text"
                      value={dedupPrefix}
                      onChange={(e) => setDedupPrefix(e.target.value)}
                      placeholder="e.g. '"
                      className="w-full rounded-lg border border-[#E8E6F2] dark:border-[#2A2E42] bg-[#F8F7FC] dark:bg-[#151824] px-2.5 py-1.5 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[#64748B] mb-1">Line Suffix</label>
                    <input
                      type="text"
                      value={dedupSuffix}
                      onChange={(e) => setDedupSuffix(e.target.value)}
                      placeholder="e.g. ',"
                      className="w-full rounded-lg border border-[#E8E6F2] dark:border-[#2A2E42] bg-[#F8F7FC] dark:bg-[#151824] px-2.5 py-1.5 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {tool.id === 'custom-qr-code-generator' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">QR Payload Template</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(
                      [
                        { id: 'url', label: 'URL / Text' },
                        { id: 'wifi', label: 'Wi-Fi Login' },
                        { id: 'vcard', label: 'vCard' },
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setQrMode(m.id)}
                        className={`py-1.5 rounded-lg font-semibold border ${
                          qrMode === m.id
                            ? 'bg-[#7047EB] text-white border-[#7047EB]'
                            : 'border-[#E8E6F2] dark:border-[#2A2E42] text-[#64748B]'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Reed-Solomon Error Correction</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['L', 'M', 'Q', 'H'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setQrEcc(lvl)}
                        className={`py-1.5 rounded-lg font-mono font-bold border ${
                          qrEcc === lvl
                            ? 'bg-[#7047EB] text-white border-[#7047EB]'
                            : 'border-[#E8E6F2] dark:border-[#2A2E42] text-[#64748B]'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#64748B] mb-1">Foreground Hex</label>
                    <input
                      type="color"
                      value={qrDarkColor}
                      onChange={(e) => setQrDarkColor(e.target.value)}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[#64748B] mb-1">Background Hex</label>
                    <input
                      type="color"
                      value={qrLightColor}
                      onChange={(e) => setQrLightColor(e.target.value)}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {tool.id === 'password-api-key-generator' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Password Length: {pwdLength}</span>
                  <span className="font-mono text-[#7047EB] font-bold">{pwdLength} chars</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={64}
                  value={pwdLength}
                  onChange={(e) => setPwdLength(Number(e.target.value))}
                  className="w-full ngt-slider"
                />
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" checked={pwdUpper} onChange={(e) => setPwdUpper(e.target.checked)} />
                    <span>Uppercase (A–Z)</span>
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" checked={pwdLower} onChange={(e) => setPwdLower(e.target.checked)} />
                    <span>Lowercase (a–z)</span>
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" checked={pwdNums} onChange={(e) => setPwdNums(e.target.checked)} />
                    <span>Numbers (2–9)</span>
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" checked={pwdSyms} onChange={(e) => setPwdSyms(e.target.checked)} />
                    <span>Symbols (!@#$)</span>
                  </label>
                </div>
              </div>
            )}

            {tool.id === 'cron-expression-generator' && (
              <div className="space-y-2 text-xs">
                <span className="block font-semibold">1-Click Schedule Presets</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Every 5m', expr: '*/5 * * * *' },
                    { label: 'Every 15m', expr: '*/15 * * * *' },
                    { label: 'Hourly', expr: '0 * * * *' },
                    { label: 'Daily 00:00', expr: '0 0 * * *' },
                    { label: 'Weekdays 9am', expr: '0 9 * * 1-5' },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setInputText(p.expr)}
                      className="px-2.5 py-1 rounded-lg border border-[#E8E6F2] dark:border-[#2A2E42] font-semibold hover:border-[#7047EB]"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Primary Action Button matching Reference Image (`⚡ Compress Images`) */}
            <button
              type="button"
              onClick={async () => {
                if (isBinaryFileTool) {
                  if (uploadedFiles.length === 0) {
                    await handleLoadSampleData();
                  } else {
                    await executeBinaryFiles(uploadedFiles);
                  }
                } else {
                  runReactiveTextEngine(false);
                  handleDownloadTextOutput();
                }
              }}
              className="w-full py-3 px-4 rounded-xl bg-[#7047EB] hover:bg-[#5E35D9] text-white text-sm font-bold shadow-md shadow-[#7047EB]/20 flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Zap className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {tool.hubId === 'image-tools' && isBinaryFileTool
                  ? uploadedFiles.length > 0
                    ? `Compress & Process (${uploadedFiles.length})`
                    : 'Compress Images'
                  : isBinaryFileTool
                    ? uploadedFiles.length > 0
                      ? `Process PDF Files (${uploadedFiles.length})`
                      : 'Process Sample PDF'
                    : 'Export & Download Output'}
              </span>
            </button>

            <div className="pt-2 border-t border-[#E8E6F2] dark:border-[#2A2E42] flex items-center justify-between text-xs text-[#64748B]">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sessionRecovery}
                  onChange={(e) => setSessionRecovery(e.target.checked)}
                />
                <span>Local Session Recovery</span>
              </label>
              <span className="font-mono">Ctrl+Enter</span>
            </div>
          </div>

          {/* "Your Privacy Matters" Box matching Reference Image Panel 3 */}
          <div className="rounded-2xl bg-[#F4F1FF] dark:bg-[#1E1B36] border border-[#DDD6FE] dark:border-[#37306B] p-5 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#252142] text-[#7047EB] flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-[#7047EB] dark:text-[#C4B5FD]">
                Your Privacy Matters
              </h3>
              <p className="text-xs text-[#253044] dark:text-[#CBD5E1] leading-relaxed">
                Files and data are processed in your browser and are not uploaded to our servers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          ZONES 4–9: Complete On-Page SEO, AEO & GEO Architecture Below the Fold
      ===================================================================== */}
      <NineZoneSeoContent
        tool={tool}
        onSelectTool={onSelectTool}
        onSelectHub={onSelectHub}
      />

      <ImageCompareModal
        item={compareItem}
        onClose={() => setCompareItem(null)}
        onDownload={handleDownloadSingleItem}
      />
    </div>
  );
}
