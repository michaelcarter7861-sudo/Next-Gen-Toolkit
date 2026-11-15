import React from 'react';
import { ExternalLink } from 'lucide-react';
import { HubId } from '../data/toolsCatalog';

export interface KeywordLinkRule {
  pattern: RegExp;
  type: 'internal' | 'external';
  href: string;
  toolId?: string;
  hubId?: HubId;
  title?: string;
}

const KEYWORD_LINK_RULES: KeywordLinkRule[] = [
  // External Authority Rules (Official Standards, W3C, IETF, ISO, MDN, Google, OWASP, NIST)
  {
    pattern: /\b(ISO 32000-1|ISO 32000)\b/i,
    type: 'external',
    href: 'https://www.iso.org/standard/51502.html',
    title: 'ISO 32000-1 Portable Document Format Standard',
  },
  {
    pattern: /\b(ISO\/IEC 18004)\b/i,
    type: 'external',
    href: 'https://www.iso.org/standard/62021.html',
    title: 'ISO/IEC 18004 QR Code Symbology Standard',
  },
  {
    pattern: /\b(RFC 8259)\b/i,
    type: 'external',
    href: 'https://datatracker.ietf.org/doc/html/rfc8259',
    title: 'IETF RFC 8259 JSON Data Interchange Standard',
  },
  {
    pattern: /\b(RFC 7519)\b/i,
    type: 'external',
    href: 'https://datatracker.ietf.org/doc/html/rfc7519',
    title: 'IETF RFC 7519 JSON Web Token (JWT) Standard',
  },
  {
    pattern: /\b(WebAssembly)\b/,
    type: 'external',
    href: 'https://webassembly.org/',
    title: 'WebAssembly (Wasm) Official Specification',
  },
  {
    pattern: /\b(HTML5 Canvas|Canvas API)\b/i,
    type: 'external',
    href: 'https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API',
    title: 'MDN HTML5 Canvas API Documentation',
  },
  {
    pattern: /\b(ArrayBuffer)\b/,
    type: 'external',
    href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer',
    title: 'MDN JavaScript ArrayBuffer Specification',
  },
  {
    pattern: /\b(Web Crypto API|crypto\.getRandomValues|CSPRNG)\b/i,
    type: 'external',
    href: 'https://www.w3.org/TR/WebCryptoAPI/',
    title: 'W3C Web Cryptography API Specification',
  },
  {
    pattern: /\b(Core Web Vitals)\b/i,
    type: 'external',
    href: 'https://web.dev/articles/vitals',
    title: 'Google web.dev Core Web Vitals Documentation',
  },
  {
    pattern: /\b(Shannon entropy)\b/i,
    type: 'external',
    href: 'https://pages.nist.gov/800-63-3/sp800-63b.html',
    title: 'NIST SP 800-63B Digital Identity Entropy Guidelines',
  },
  {
    pattern: /\b(ISO-8601|ISO 8601)\b/i,
    type: 'external',
    href: 'https://www.iso.org/iso-8601-date-and-time-format.html',
    title: 'ISO 8601 Date and Time Format Standard',
  },
  {
    pattern: /\b(Reed-Solomon)\b/i,
    type: 'external',
    href: 'https://www.iso.org/standard/62021.html',
    title: 'ISO/IEC 18004 Reed-Solomon Error Correction',
  },

  // Internal Tool & Category Keyword Rules
  {
    pattern: /\b(Offline PDF Compressor|compress a PDF under 200KB|compress PDF)\b/i,
    type: 'internal',
    href: '/pdf-tools/compress-pdf/',
    toolId: 'compress-pdf',
  },
  {
    pattern: /\b(PDF Merger & Page Organizer|PDF Merger|merge multiple PDFs|combine multiple PDF)\b/i,
    type: 'internal',
    href: '/pdf-tools/merge-pdf/',
    toolId: 'merge-pdf',
  },
  {
    pattern: /\b(PDF Splitter|split PDF)\b/i,
    type: 'internal',
    href: '/pdf-tools/split-pdf/',
    toolId: 'split-pdf',
  },
  {
    pattern: /\b(PDF Metadata & Forensic Cleaner|PDF Metadata & Sanitizer|XMP metadata|XMP tags)\b/i,
    type: 'internal',
    href: '/pdf-tools/pdf-metadata-cleaner/',
    toolId: 'pdf-metadata-cleaner',
  },
  {
    pattern: /\b(Image to PDF|Images to PDF Studio)\b/i,
    type: 'internal',
    href: '/pdf-tools/image-to-pdf/',
    toolId: 'image-to-pdf',
  },
  {
    pattern: /\b(Target-KB Image Compressor|Image Compressor|20KB–50KB|20KB, 50KB, or 100KB)\b/i,
    type: 'internal',
    href: '/image-tools/compress-image-to-kb/',
    toolId: 'compress-image-to-kb',
  },
  {
    pattern: /\b(Bulk WebP & Image Format Converter|Bulk WebP & Format Converter|WebP files|convert PNG and JPEG images to WebP)\b/i,
    type: 'internal',
    href: '/image-tools/bulk-webp-avif-converter/',
    toolId: 'bulk-webp-avif-converter',
  },
  {
    pattern: /\b(EXIF Metadata Viewer & Scrubber|EXIF & GPS Privacy Scrubber|EXIF metadata|GPS latitude\/longitude)\b/i,
    type: 'internal',
    href: '/image-tools/exif-metadata-remover/',
    toolId: 'exif-metadata-remover',
  },
  {
    pattern: /\b(Image to Text \(OCR\) Extractor|Browser OCR|optical character recognition)\b/i,
    type: 'internal',
    href: '/image-tools/image-to-text-ocr/',
    toolId: 'image-to-text-ocr',
  },
  {
    pattern: /\b(JSON Formatter, Validator & Auto-Fixer|JSON Formatter & Auto-Fixer|JSON Formatter|broken JSON)\b/i,
    type: 'internal',
    href: '/dev-tools/json-formatter-validator/',
    toolId: 'json-formatter-validator',
  },
  {
    pattern: /\b(LLM Token Counter & Context Packer|LLM Token Counter|BPE token counts)\b/i,
    type: 'internal',
    href: '/dev-tools/llm-token-counter/',
    toolId: 'llm-token-counter',
  },
  {
    pattern: /\b(JWT Decoder & Inspector|JWT tokens|JWT claims)\b/i,
    type: 'internal',
    href: '/dev-tools/jwt-decoder/',
    toolId: 'jwt-decoder',
  },
  {
    pattern: /\b(Base64\/URL Codec|Base64, URL & Entity Codec)\b/i,
    type: 'internal',
    href: '/dev-tools/base64-url-encoder/',
    toolId: 'base64-url-encoder',
  },
  {
    pattern: /\b(Live Regex Tester|Regex AST)\b/i,
    type: 'internal',
    href: '/dev-tools/regex-tester/',
    toolId: 'regex-tester',
  },
  {
    pattern: /\b(Code & Text Diff Checker|Unified diff)\b/i,
    type: 'internal',
    href: '/dev-tools/code-diff-checker/',
    toolId: 'code-diff-checker',
  },
  {
    pattern: /\b(Word Counter & Keyword Density Analyzer|Word Counter & SEO Density|keyword density)\b/i,
    type: 'internal',
    href: '/text-tools/word-counter-density/',
    toolId: 'word-counter-density',
  },
  {
    pattern: /\b(Text to TXT \/ Markdown & AI Watermark Cleaner|Text to TXT & AI Watermark Cleaner|zero-width spaces)\b/i,
    type: 'internal',
    href: '/text-tools/text-to-txt-markdown/',
    toolId: 'text-to-txt-markdown',
  },
  {
    pattern: /\b(Case Converter & URL Slug Generator|Case Converter & SEO Slug Maker|SEO slugs|kebab-case)\b/i,
    type: 'internal',
    href: '/text-tools/case-converter-slug-generator/',
    toolId: 'case-converter-slug-generator',
  },
  {
    pattern: /\b(Duplicate Line Remover & Text Sorter|Duplicate Line & List Cleaner)\b/i,
    type: 'internal',
    href: '/text-tools/duplicate-line-remover/',
    toolId: 'duplicate-line-remover',
  },
  {
    pattern: /\b(Custom QR Code Studio|Custom QR Code Generator|Custom SVG\/PNG QR Code Studio)\b/i,
    type: 'internal',
    href: '/generators/custom-qr-code-generator/',
    toolId: 'custom-qr-code-generator',
  },
  {
    pattern: /\b(Password & API Key Generator|Crypto Password & API Key Generator)\b/i,
    type: 'internal',
    href: '/generators/password-api-key-generator/',
    toolId: 'password-api-key-generator',
  },
  {
    pattern: /\b(Unix Timestamp Converter|Epoch & Timezone Converter|epoch timestamp)\b/i,
    type: 'internal',
    href: '/generators/unix-timestamp-converter/',
    toolId: 'unix-timestamp-converter',
  },
  {
    pattern: /\b(Cron Expression Generator & Explainer|Cron Expression Studio|5-field cron expression)\b/i,
    type: 'internal',
    href: '/generators/cron-expression-generator/',
    toolId: 'cron-expression-generator',
  },
];

interface RichSeoTextProps {
  text: string;
  excludeToolId?: string;
  onSelectTool?: (toolId: string) => void;
  onSelectHub?: (hubId: HubId) => void;
  maxLinks?: number;
}

export function RichSeoText({
  text,
  excludeToolId,
  onSelectTool,
  onSelectHub,
  maxLinks = 4,
}: RichSeoTextProps) {
  const basePath = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const resolveHref = (path: string) => `${basePath}${path.replace(/^\/+/, '')}`;

  type Segment =
    | { kind: 'text'; value: string }
    | { kind: 'link'; value: string; rule: KeywordLinkRule };

  let segments: Segment[] = [{ kind: 'text', value: text }];
  let linksAdded = 0;

  for (const rule of KEYWORD_LINK_RULES) {
    if (linksAdded >= maxLinks) break;
    if (excludeToolId && rule.toolId === excludeToolId) continue;

    const nextSegments: Segment[] = [];
    let matchedInPass = false;

    for (const seg of segments) {
      if (seg.kind !== 'text' || matchedInPass) {
        nextSegments.push(seg);
        continue;
      }

      const match = rule.pattern.exec(seg.value);
      if (!match || match.index === undefined) {
        nextSegments.push(seg);
        continue;
      }

      const before = seg.value.slice(0, match.index);
      const matchedWord = match[0];
      const after = seg.value.slice(match.index + matchedWord.length);

      if (before) nextSegments.push({ kind: 'text', value: before });
      nextSegments.push({ kind: 'link', value: matchedWord, rule });
      if (after) nextSegments.push({ kind: 'text', value: after });

      matchedInPass = true;
      linksAdded++;
    }

    segments = nextSegments;
  }

  return (
    <>
      {segments.map((seg, idx) => {
        if (seg.kind === 'text') {
          return <React.Fragment key={idx}>{seg.value}</React.Fragment>;
        }

        const { rule, value } = seg;
        if (rule.type === 'external') {
          return (
            <a
              key={idx}
              href={rule.href}
              target="_blank"
              rel="noopener noreferrer"
              title={rule.title || value}
              className="inline-flex items-center gap-0.5 font-semibold text-[#7047EB] dark:text-[#A78BFA] underline decoration-[#7047EB]/40 hover:decoration-[#7047EB] underline-offset-2"
            >
              <span>{value}</span>
              <ExternalLink className="w-3 h-3 inline shrink-0" aria-hidden="true" />
            </a>
          );
        }

        return (
          <a
            key={idx}
            href={resolveHref(rule.href)}
            onClick={(e) => {
              if (rule.toolId && onSelectTool) {
                e.preventDefault();
                onSelectTool(rule.toolId);
              } else if (rule.hubId && onSelectHub) {
                e.preventDefault();
                onSelectHub(rule.hubId);
              }
            }}
            className="font-semibold text-[#7047EB] dark:text-[#A78BFA] underline decoration-[#7047EB]/40 hover:decoration-[#7047EB] underline-offset-2"
          >
            {value}
          </a>
        );
      })}
    </>
  );
}
