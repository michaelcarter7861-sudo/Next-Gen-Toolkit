import { HubId } from './toolsCatalog';

export interface FaqEntry {
  q: string;
  a: string;
}

export interface InternalKeywordLink {
  keywordAnchor: string;
  toolId?: string;
  hubId?: HubId;
  href: string;
  contextAfter: string;
}

export interface ExternalAuthorityLink {
  keywordAnchor: string;
  url: string;
  sourceName: string;
  contextSentence: string;
}

export interface ToolEditorialLinkPack {
  leadIntro: string;
  internalLinks: InternalKeywordLink[];
  externalLinks: ExternalAuthorityLink[];
}

export interface HubEditorialLinkPack {
  editorialSummary: string;
  internalLinks: InternalKeywordLink[];
  externalLinks: ExternalAuthorityLink[];
}

export const HOME_FAQS: FaqEntry[] = [
  {
    q: 'How does NextGenToolkit handle file and text privacy?',
    a: 'Processing depends on the individual utility. Many core PDF, image, text, and developer tools process inputs locally in your browser without sending those inputs to our processing servers. This does not mean the website makes no network requests: Google Tag Manager and Google Analytics may receive page and interaction events. AI-powered or other remote-service features may send the data needed for the requested operation to the relevant provider. Check each tool\'s processing notes before submitting sensitive information. No sign-up is required for the free browser tools.',
  },
  {
    q: 'How do I compress an image or PDF to an exact 20KB, 50KB, or 100KB portal limit?',
    a: 'Open the Target-KB Image Compressor or Offline PDF Compressor and click one of the 1-Click Portal Presets (20 KB Exam Sign, 50 KB Passport/Visa, 100 KB Gov Portal, or 200 KB Official PDF). Our client-side binary-search encoder automatically tunes quality and resolution to land right under your strict file-size ceiling.',
  },
  {
    q: 'How does 1-Click Tool Chaining work between utilities?',
    a: 'After processing a file or text snippet in any utility, click the "Chain Output to Next Tool" button in the output toolbar. NextGenToolkit pipes your processed PDF, image, or formatted JSON directly into the next utility (for example, Image Compressor → Image to PDF, or JSON Formatter → LLM Token Counter) without downloading and re-uploading.',
  },
  {
    q: 'Do QR codes generated on NextGenToolkit ever expire?',
    a: 'Never. Unlike commercial QR sites that route scans through expiring tracking links, our Custom QR Code Studio encodes your URL or text directly into an ISO/IEC 18004 compliant SVG vector or high-DPI PNG matrix. Your QR codes work permanently offline and in print forever.',
  },
  {
    q: 'Can I process multiple PDFs or images at once and download them as a single ZIP?',
    a: 'Yes. You can drag and drop multiple images or PDF documents into any binary workspace, process the entire batch locally in milliseconds, and click "Download All as ZIP" to export a single archive generated in-memory via fflate.',
  },
  {
    q: 'Why does my broken JSON from ChatGPT or Claude fail in standard validators?',
    a: 'LLM outputs frequently include trailing commas, unquoted keys, single-quoted strings, Markdown code fences, or invisible UTF-8 byte-order marks (\\uFEFF). Our JSON Formatter & Auto-Fixer detects and repairs these syntax issues in one click and lets you export to CSV, YAML, TypeScript, or SQL.',
  },
];

export const HUB_FAQS: Record<HubId, FaqEntry[]> = {
  'pdf-tools': [
    {
      q: 'Are my confidential PDF contracts and bank statements uploaded to a server?',
      a: 'The core PDF utilities described here process PDF files locally in your browser using client-side libraries; they do not upload the PDF contents to our servers for those operations. Processing behavior can differ for other site features, so check the individual tool\'s processing notes before submitting sensitive documents.',
    },
    {
      q: 'How can I reduce a PDF under 200KB for government or university portals?',
      a: 'Open the Offline PDF Compressor, select the "200 KB · Official PDF" or "100 KB · Gov Portal" preset, and run the tool. It strips redundant XMP/Info metadata streams and optimizes object streams locally to meet strict upload limits.',
    },
    {
      q: 'Can I merge multiple PDFs and reorder or rotate pages before downloading?',
      a: 'Yes. Drop two or more PDF files into the PDF Merger & Page Organizer, choose your desired page rotation, and combine them into a single unified ISO 32000-1 PDF document in milliseconds.',
    },
    {
      q: 'How do I remove hidden author names and creation timestamps from a PDF?',
      a: 'Use the PDF Metadata & Sanitizer to inspect all embedded Producer, Creator, Author, CreationDate, and XMP tags and scrub them completely before sharing your document.',
    },
  ],
  'image-tools': [
    {
      q: 'Why do government and exam portals reject my photo even when it is under 50KB?',
      a: 'Portals such as UPSC, SSC, DS-160, and visa systems validate both byte size (e.g., 20KB–50KB) and color profile/EXIF headers. Our Target-KB Image Compressor outputs clean sRGB JPEG/WebP/PNG files with camera EXIF metadata stripped so portal validators accept them immediately.',
    },
    {
      q: 'Can I batch convert PNG and JPEG images to WebP for Core Web Vitals?',
      a: 'Yes. Drop your images into the Bulk WebP & Format Converter, adjust the quality slider, and download all transcoded WebP files together as a single batch ZIP archive.',
    },
    {
      q: 'How do I remove GPS location coordinates from smartphone photos before posting?',
      a: 'Open the EXIF & GPS Privacy Scrubber to inspect embedded camera model, shutter speed, and GPS latitude/longitude tags, then download a 100% scrubbed copy with all personal metadata removed.',
    },
    {
      q: 'Can I extract text from a scanned receipt or screenshot without uploading it?',
      a: 'Yes. The Browser OCR (Image to Text) tool runs optical character recognition directly inside your browser so you can copy text from screenshots, receipts, and scanned notes privately.',
    },
  ],
  'dev-tools': [
    {
      q: 'How do I fix malformed JSON with trailing commas or single quotes?',
      a: 'Paste your payload into the JSON Formatter & Auto-Fixer and click "1-Click Auto-Fix JSON". It automatically strips comments, removes trailing commas, normalizes single quotes, and quotes unquoted keys.',
    },
    {
      q: 'Is it safe to decode production JWT tokens and inspect API keys here?',
      a: 'The JWT Decoder & Inspector and Base64/URL Codec are designed to decode the supplied values in your browser. Do not assume this describes every developer or AI feature on the site: remote-service features may transmit the data required for that operation to their providers. Review the tool\'s processing notes before using sensitive tokens or credentials.',
    },
    {
      q: 'How are LLM token counts and API costs calculated?',
      a: 'Our LLM Token Counter & Context Packer estimates subword BPE token counts and compares input/output API pricing across modern Gemini, GPT-4o, and Claude models in real time.',
    },
    {
      q: 'Can I convert a JSON array directly into CSV, YAML, TypeScript interfaces, or SQL?',
      a: 'Yes. Inside the JSON Formatter & Auto-Fixer, switch between the JSON, CSV, YAML, TypeScript, and SQL Table tabs in the output header to transform your data structure immediately.',
    },
  ],
  'text-tools': [
    {
      q: 'How do I remove hidden ChatGPT or Claude watermarks and zero-width characters?',
      a: 'Paste your text into the Text to TXT & AI Watermark Cleaner. It detects and strips invisible zero-width spaces (\\u200B, \\uFEFF), non-breaking spaces (\\u00A0), and smart quotes while normalizing clean Markdown or plain text.',
    },
    {
      q: 'What is the ideal keyword density and SERP title pixel width for SEO?',
      a: 'Natural editorial copy typically keeps primary 1-gram and 2-gram phrases between 1% and 2.5% density, with page titles under 60 characters (~580px). Our Word Counter & SEO Density analyzer measures both in real time.',
    },
    {
      q: 'How do I generate clean URL slugs from article headlines?',
      a: 'Use the Case Converter & SEO Slug Maker to strip stop words, punctuation, and accents and convert multi-line titles into lowercase hyphenated SEO slugs (kebab-case) alongside 11 other naming conventions.',
    },
    {
      q: 'Can I deduplicate and sort thousands of lines of text at once?',
      a: 'Yes. The Duplicate Line & List Cleaner processes tens of thousands of lines in browser memory with options for case sensitivity, whitespace trimming, and alphabetical or length-based sorting.',
    },
  ],
  generators: [
    {
      q: 'Are custom QR codes generated here static and permanent?',
      a: 'Yes. Every QR code created in our Custom SVG/PNG QR Code Studio encodes your destination URL or text directly into the QR matrix with customizable error correction (L, M, Q, H) and zero middleman redirects.',
    },
    {
      q: 'How does the Crypto Password & API Key Generator ensure cryptographic security?',
      a: 'It uses your browser hardware-backed Web Crypto API (window.crypto.getRandomValues) rather than Math.random(), and calculates exact bits of Shannon entropy and offline brute-force crack time.',
    },
    {
      q: 'Does the Epoch & Timezone Converter handle both 10-digit seconds and 13-digit milliseconds?',
      a: 'Yes. Paste any 10-digit (seconds) or 13-digit (milliseconds) epoch timestamp and the converter automatically detects the precision, displaying UTC, local ISO-8601, and relative time formats.',
    },
    {
      q: 'How can I verify when a 5-field cron schedule will run next?',
      a: 'Enter any standard 5-field cron expression (such as */15 * * * * or 0 9 * * 1-5) into the Cron Expression Studio to see a plain-English translation and the next 10 exact execution timestamps.',
    },
  ],
};

export const HUB_EDITORIAL_LINKS: Record<HubId, HubEditorialLinkPack> = {
  'pdf-tools': {
    editorialSummary:
      'Complete confidential document workflows inside your browser without uploading files to external cloud servers.',
    internalLinks: [
      {
        keywordAnchor: 'compress PDF under 100KB or 200KB',
        toolId: 'compress-pdf',
        href: '/pdf-tools/compress-pdf/',
        contextAfter: 'for government, university, and visa application portals,',
      },
      {
        keywordAnchor: 'merge multiple PDF files into one document',
        toolId: 'merge-pdf',
        href: '/pdf-tools/merge-pdf/',
        contextAfter: 'with custom page rotation and instant ordering, or',
      },
      {
        keywordAnchor: 'remove hidden PDF author and XMP metadata',
        toolId: 'pdf-metadata-cleaner',
        href: '/pdf-tools/pdf-metadata-cleaner/',
        contextAfter: 'before publishing legal or financial records.',
      },
    ],
    externalLinks: [
      {
        keywordAnchor: 'ISO 32000-1 Portable Document Format specification',
        url: 'https://www.iso.org/standard/51502.html',
        sourceName: 'ISO.org',
        contextSentence:
          'All document reconstruction adheres strictly to the official ISO 32000-1 Portable Document Format specification for cross-viewer compatibility.',
      },
      {
        keywordAnchor: 'OWASP File Upload and Document Privacy Guidelines',
        url: 'https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html',
        sourceName: 'OWASP Foundation',
        contextSentence:
          'Core browser-only tools process file bytes locally; any feature using a remote provider should disclose the data it sends and the provider involved.',
      },
    ],
  },
  'image-tools': {
    editorialSummary:
      'Optimize raster graphics for strict portal byte ceilings, faster Core Web Vitals, and personal location privacy.',
    internalLinks: [
      {
        keywordAnchor: 'compress image to exact 20KB or 50KB',
        toolId: 'compress-image-to-kb',
        href: '/image-tools/compress-image-to-kb/',
        contextAfter: 'for online exam signatures and passport portals,',
      },
      {
        keywordAnchor: 'batch convert PNG and JPG to WebP',
        toolId: 'bulk-webp-avif-converter',
        href: '/image-tools/bulk-webp-avif-converter/',
        contextAfter: 'to accelerate page load performance, or',
      },
      {
        keywordAnchor: 'strip EXIF GPS coordinates from photos',
        toolId: 'exif-metadata-remover',
        href: '/image-tools/exif-metadata-remover/',
        contextAfter: 'before sharing smartphone images online.',
      },
    ],
    externalLinks: [
      {
        keywordAnchor: 'Google web.dev Core Web Vitals image optimization',
        url: 'https://web.dev/learn/images',
        sourceName: 'Google web.dev',
        contextSentence:
          'Modern WebP compression and responsive sizing follow Google web.dev Core Web Vitals image optimization standards to improve Largest Contentful Paint (LCP).',
      },
      {
        keywordAnchor: 'MDN HTMLCanvasElement.toBlob encoding API',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob',
        sourceName: 'MDN Web Docs',
        contextSentence:
          'Hardware-accelerated pixel transcoding executes directly through the MDN HTMLCanvasElement.toBlob encoding API without remote server round-trips.',
      },
    ],
  },
  'dev-tools': {
    editorialSummary:
      'Debug API payloads, benchmark LLM token budgets, inspect authentication claims, and diff code locally.',
    internalLinks: [
      {
        keywordAnchor: 'format and auto-fix broken JSON syntax',
        toolId: 'json-formatter-validator',
        href: '/dev-tools/json-formatter-validator/',
        contextAfter: 'with instant export to CSV, TypeScript, and SQL,',
      },
      {
        keywordAnchor: 'calculate LLM prompt tokens and API costs',
        toolId: 'llm-token-counter',
        href: '/dev-tools/llm-token-counter/',
        contextAfter: 'across Gemini, GPT-4o, and Claude models, or',
      },
      {
        keywordAnchor: 'decode JWT header and payload claims offline',
        toolId: 'jwt-decoder',
        href: '/dev-tools/jwt-decoder/',
        contextAfter: 'without exposing production bearer tokens over the network.',
      },
    ],
    externalLinks: [
      {
        keywordAnchor: 'IETF RFC 8259 JSON Data Interchange Standard',
        url: 'https://datatracker.ietf.org/doc/html/rfc8259',
        sourceName: 'IETF Datatracker',
        contextSentence:
          'Strict payload validation enforces the IETF RFC 8259 JSON Data Interchange Standard while providing automated recovery for trailing commas and unquoted keys.',
      },
      {
        keywordAnchor: 'IETF RFC 7519 JSON Web Token (JWT) specification',
        url: 'https://datatracker.ietf.org/doc/html/rfc7519',
        sourceName: 'IETF Datatracker',
        contextSentence:
          'Token inspection parses Base64Url segments and expiration timestamps according to the IETF RFC 7519 JSON Web Token (JWT) specification.',
      },
    ],
  },
  'text-tools': {
    editorialSummary:
      'Analyze N-gram keyword density, sanitize hidden AI watermarks, generate clean SEO URL slugs, and deduplicate lists.',
    internalLinks: [
      {
        keywordAnchor: 'check word count and N-gram keyword density',
        toolId: 'word-counter-density',
        href: '/text-tools/word-counter-density/',
        contextAfter: 'alongside live Google SERP title pixel width,',
      },
      {
        keywordAnchor: 'remove invisible AI zero-width watermarks',
        toolId: 'text-to-txt-markdown',
        href: '/text-tools/text-to-txt-markdown/',
        contextAfter: 'from LLM drafts and rich-text editors, or',
      },
      {
        keywordAnchor: 'generate clean lowercase SEO URL slugs',
        toolId: 'case-converter-slug-generator',
        href: '/text-tools/case-converter-slug-generator/',
        contextAfter: 'with automated stop-word stripping.',
      },
    ],
    externalLinks: [
      {
        keywordAnchor: 'Google Search Central helpful content guidelines',
        url: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content',
        sourceName: 'Google Search Central',
        contextSentence:
          'Balanced unigram and bigram phrase distribution aligns your editorial copy with Google Search Central helpful content guidelines and prevents over-optimization.',
      },
      {
        keywordAnchor: 'Unicode Standard Annex #15 text normalization',
        url: 'https://unicode.org/reports/tr15/',
        sourceName: 'Unicode Consortium',
        contextSentence:
          'Character sanitization and slug generation rely on Unicode Standard Annex #15 text normalization to strip diacritics and zero-width formatting marks.',
      },
    ],
  },
  generators: {
    editorialSummary:
      'Create permanent vector QR codes, hardware-seeded cryptographic keys, epoch timestamps, and cron schedules.',
    internalLinks: [
      {
        keywordAnchor: 'generate non-expiring vector SVG QR codes',
        toolId: 'custom-qr-code-generator',
        href: '/generators/custom-qr-code-generator/',
        contextAfter: 'for URLs, Wi-Fi credentials, and business cards,',
      },
      {
        keywordAnchor: 'generate CSPRNG passwords and 256-bit API keys',
        toolId: 'password-api-key-generator',
        href: '/generators/password-api-key-generator/',
        contextAfter: 'with live Shannon entropy calculation, or',
      },
      {
        keywordAnchor: 'convert Unix epoch timestamps across timezones',
        toolId: 'unix-timestamp-converter',
        href: '/generators/unix-timestamp-converter/',
        contextAfter: 'with automatic second, millisecond, and nanosecond detection.',
      },
    ],
    externalLinks: [
      {
        keywordAnchor: 'ISO/IEC 18004 QR Code symbology specification',
        url: 'https://www.iso.org/standard/62021.html',
        sourceName: 'ISO.org',
        contextSentence:
          'Every QR matrix is encoded directly with Reed-Solomon error correction per the ISO/IEC 18004 QR Code symbology specification.',
      },
      {
        keywordAnchor: 'W3C Web Cryptography API (crypto.getRandomValues)',
        url: 'https://www.w3.org/TR/WebCryptoAPI/',
        sourceName: 'W3C Standards',
        contextSentence:
          'Secret generation uses OS-seeded entropy via the W3C Web Cryptography API (crypto.getRandomValues) and NIST SP 800-63B guidelines.',
      },
    ],
  },
};

export const TOOL_EDITORIAL_LINKS: Record<string, ToolEditorialLinkPack> = {
  'compress-pdf': {
    leadIntro:
      'When preparing official PDF applications, you can',
    internalLinks: [
      {
        keywordAnchor: 'merge multiple PDF files into one document',
        toolId: 'merge-pdf',
        href: '/pdf-tools/merge-pdf/',
        contextAfter: 'before running target-KB compression,',
      },
      {
        keywordAnchor: 'scrub hidden PDF metadata and XMP tags',
        toolId: 'pdf-metadata-cleaner',
        href: '/pdf-tools/pdf-metadata-cleaner/',
        contextAfter: 'to shave off extra kilobytes, or',
      },
      {
        keywordAnchor: 'compress JPEG and PNG images to 20KB or 50KB',
        toolId: 'compress-image-to-kb',
        href: '/image-tools/compress-image-to-kb/',
        contextAfter: 'prior to embedding scans into your document.',
      },
    ],
    externalLinks: [
      {
        keywordAnchor: 'ISO 32000-1 PDF object stream specification',
        url: 'https://www.iso.org/standard/51502.html',
        sourceName: 'ISO.org',
        contextSentence:
          'Our client-side compressor reconstructs cross-reference tables and object streams in compliance with the ISO 32000-1 PDF object stream specification.',
      },
      {
        keywordAnchor: 'MDN JavaScript ArrayBuffer binary memory API',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer',
        sourceName: 'MDN Web Docs',
        contextSentence:
          'Core file operations use browser APIs such as ArrayBuffer where supported. Optional remote-service features may transmit necessary inputs to providers; check each tool's processing notes.',
      },
    ],
  },
  'merge-pdf': {
    leadIntro:
      'To build a complete submission packet in your browser, you can combine files here and then',
    internalLinks: [
      {
        keywordAnchor: 'compress your merged PDF under 200KB',
        toolId: 'compress-pdf',
        href: '/pdf-tools/compress-pdf/',
        contextAfter: 'for strict portal upload limits,',
      },
      {
        keywordAnchor: 'split or extract specific PDF page ranges',
        toolId: 'split-pdf',
        href: '/pdf-tools/split-pdf/',
        contextAfter: 'to remove unneeded cover sheets, or',
      },
      {
        keywordAnchor: 'convert JPG and PNG scans into a PDF',
        toolId: 'image-to-pdf',
        href: '/pdf-tools/image-to-pdf/',
        contextAfter: 'before joining them with existing contracts.',
      },
    ],
    externalLinks: [
      {
        keywordAnchor: 'Adobe Portable Document Format (PDF 1.7) reference',
        url: 'https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/PDF32000_2008.pdf',
        sourceName: 'Adobe Open Source',
        contextSentence:
          'Page tree merging and catalog stitching follow the Adobe Portable Document Format (PDF 1.7) reference to preserve vector fonts and annotations.',
      },
      {
        keywordAnchor: 'WebAssembly (Wasm) sandboxed execution standard',
        url: 'https://webassembly.org/',
        sourceName: 'WebAssembly.org',
        contextSentence:
          'Document assembly runs locally under the WebAssembly (Wasm) sandboxed execution standard with zero cloud queue latency.',
      },
    ],
  },
  'split-pdf': {
    leadIntro:
      'After extracting custom page ranges from a large document, you can immediately',
    internalLinks: [
      {
        keywordAnchor: 'compress the extracted PDF pages to exact KB',
        toolId: 'compress-pdf',
        href: '/pdf-tools/compress-pdf/',
        contextAfter: 'for email or portal upload,',
      },
      {
        keywordAnchor: 'convert PDF pages into 300 DPI or 600 DPI PNG images',
        toolId: 'pdf-to-image',
        href: '/pdf-tools/pdf-to-image/',
        contextAfter: 'for slide decks, or',
      },
      {
        keywordAnchor: 'merge selected PDF chapters back together',
        toolId: 'merge-pdf',
        href: '/pdf-tools/merge-pdf/',
        contextAfter: 'in any custom order.',
      },
    ],
    externalLinks: [
      {
        keywordAnchor: 'ISO 32000-2 (PDF 2.0) document structure standard',
        url: 'https://www.iso.org/standard/75839.html',
        sourceName: 'ISO.org',
        contextSentence:
          'Independent page extraction preserves resource dictionaries in accordance with the ISO 32000-2 (PDF 2.0) document structure standard.',
      },
      {
        keywordAnchor: 'MDN Blob client-side file construction API',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/Blob',
        sourceName: 'MDN Web Docs',
        contextSentence:
          'Extracted page ranges are packaged into downloadable files using the MDN Blob client-side file construction API.',
      },
    ],
  },
  'pdf-to-image': {
    leadIntro:
      'Once your PDF pages are rasterized into high-resolution PNG, JPEG, or WebP graphics, you can',
    internalLinks: [
      {
        keywordAnchor: 'compress rendered images to 50KB or 100KB',
        toolId: 'compress-image-to-kb',
        href: '/image-tools/compress-image-to-kb/',
        contextAfter: 'for fast web embedding,',
      },
      {
        keywordAnchor: 'batch convert exported PNGs to WebP',
        toolId: 'bulk-webp-avif-converter',
        href: '/image-tools/bulk-webp-avif-converter/',
        contextAfter: 'for Core Web Vitals optimization, or',
      },
      {
        keywordAnchor: 'extract text from scanned PDF pages using Browser OCR',
        toolId: 'image-to-text-ocr',
        href: '/image-tools/image-to-text-ocr/',
        contextAfter: 'when working with non-selectable scans.',
      },
    ],
    externalLinks: [
      {
        keywordAnchor: 'MDN CanvasRenderingContext2D rasterization API',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D',
        sourceName: 'MDN Web Docs',
        contextSentence:
          'High-DPI vector-to-bitmap rendering utilizes the MDN CanvasRenderingContext2D rasterization API for crisp typography at 300 and 600 DPI.',
      },
      {
        keywordAnchor: 'Google web.dev image format selection guide',
        url: 'https://web.dev/learn/images',
        sourceName: 'Google web.dev',
        contextSentence:
          'Choose between lossless PNG and modern WebP output based on the Google web.dev image format selection guide.',
      },
    ],
  },
  'image-to-pdf': {
    leadIntro:
      'Before or after compiling your receipts, ID cards, or photographs into an A4/Letter PDF, you can',
    internalLinks: [
      {
        keywordAnchor: 'compress source photos to exact kilobyte targets',
        toolId: 'compress-image-to-kb',
        href: '/image-tools/compress-image-to-kb/',
        contextAfter: 'so the resulting PDF stays lightweight,',
      },
      {
        keywordAnchor: 'remove EXIF GPS location metadata from photos',
        toolId: 'exif-metadata-remover',
        href: '/image-tools/exif-metadata-remover/',
        contextAfter: 'for privacy compliance, or',
      },
      {
        keywordAnchor: 'compress the final PDF under 200KB',
        toolId: 'compress-pdf',
        href: '/pdf-tools/compress-pdf/',
        contextAfter: 'for portal submission.',
      },
    ],
    externalLinks: [
      {
        keywordAnchor: 'ISO 216 international A4 paper size standard',
        url: 'https://www.iso.org/standard/36631.html',
        sourceName: 'ISO.org',
        contextSentence:
          'Page layout geometry conforms to the ISO 216 international A4 paper size standard (210 × 297 mm) and ANSI Letter dimensions.',
      },
      {
        keywordAnchor: 'MDN HTMLCanvasElement image encoding specification',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL',
        sourceName: 'MDN Web Docs',
        contextSentence:
          'Image normalization and orientation correction leverage the MDN HTMLCanvasElement image encoding specification.',
      },
    ],
  },
  'pdf-metadata-cleaner': {
    leadIntro:
      'To complete a thorough document privacy audit before external distribution, combine this tool with utilities to',
    internalLinks: [
      {
        keywordAnchor: 'compress the sanitized PDF to a smaller file size',
        toolId: 'compress-pdf',
        href: '/pdf-tools/compress-pdf/',
        contextAfter: 'in one click,',
      },
      {
        keywordAnchor: 'scrub EXIF camera and GPS metadata from images',
        toolId: 'exif-metadata-remover',
        href: '/image-tools/exif-metadata-remover/',
        contextAfter: 'alongside your PDF documents, or',
      },
      {
        keywordAnchor: 'split confidential pages out of a PDF',
        toolId: 'split-pdf',
        href: '/pdf-tools/split-pdf/',
        contextAfter: 'prior to sharing.',
      },
    ],
    externalLinks: [
      {
        keywordAnchor: 'Adobe Extensible Metadata Platform (XMP) standard',
        url: 'https://www.adobe.com/devnet/xmp.html',
        sourceName: 'Adobe Developer',
        contextSentence:
          'Our sanitizer inspects and clears both the classic PDF /Info dictionary and the Adobe Extensible Metadata Platform (XMP) standard packet.',
      },
      {
        keywordAnchor: 'OWASP File Upload and Metadata Security Cheat Sheet',
        url: 'https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html',
        sourceName: 'OWASP Foundation',
        contextSentence:
          'Stripping hidden author, producer, and path attributes aligns with the OWASP File Upload and Metadata Security Cheat Sheet.',
      },
    ],
  },
  'compress-image-to-kb': {
    leadIntro:
      'Preparing photos and signatures for strict online portals is seamless when you chain this compressor to',
    internalLinks: [
      {
        keywordAnchor: 'resize image dimensions and aspect ratios',
        toolId: 'social-media-image-resizer',
        href: '/image-tools/social-media-image-resizer/',
        contextAfter: 'to match exact pixel requirements,',
      },
      {
        keywordAnchor: 'convert compressed images into a single PDF',
        toolId: 'image-to-pdf',
        href: '/pdf-tools/image-to-pdf/',
        contextAfter: 'for document uploads, or',
      },
      {
        keywordAnchor: 'remove EXIF GPS coordinates and camera tags',
        toolId: 'exif-metadata-remover',
        href: '/image-tools/exif-metadata-remover/',
        contextAfter: 'so portal validators never reject your file.',
      },
    ],
    externalLinks: [
      {
        keywordAnchor: 'Google web.dev image compression best practices',
        url: 'https://web.dev/articles/fast#optimize_your_images',
        sourceName: 'Google web.dev',
        contextSentence:
          'Chroma subsampling and quantization tuning follow Google web.dev image compression best practices to preserve crisp text and facial detail at low KB sizes.',
      },
      {
        keywordAnchor: 'MDN HTMLCanvasElement.toBlob client-side encoder',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob',
        sourceName: 'MDN Web Docs',
        contextSentence:
          'Iterative binary-search encoding executes locally through the MDN HTMLCanvasElement.toBlob client-side encoder.',
      },
    ],
  },
  'bulk-webp-avif-converter': {
    leadIntro:
      'When modernizing website media assets for faster page speed, you can also',
    internalLinks: [
      {
        keywordAnchor: 'compress images to an exact KB budget',
        toolId: 'compress-image-to-kb',
        href: '/image-tools/compress-image-to-kb/',
        contextAfter: 'for hero banners and thumbnails,',
      },
      {
        keywordAnchor: 'batch resize images for social media and e-commerce',
        toolId: 'social-media-image-resizer',
        href: '/image-tools/social-media-image-resizer/',
        contextAfter: 'in one pass, or',
      },
      {
        keywordAnchor: 'strip EXIF metadata from product photos',
        toolId: 'exif-metadata-remover',
        href: '/image-tools/exif-metadata-remover/',
        contextAfter: 'to reduce payload overhead.',
      },
    ],
    externalLinks: [
      {
        keywordAnchor: 'Google WebP image format technical documentation',
        url: 'https://developers.google.com/speed/webp',
        sourceName: 'Google Developers',
        contextSentence:
          'WebP encoding delivers 25%–34% smaller byte sizes compared to JPEG as benchmarked in the Google WebP image format technical documentation.',
      },
      {
        keywordAnchor: 'W3C Portable Network Graphics (PNG) specification',
        url: 'https://www.w3.org/TR/png/',
        sourceName: 'W3C Standards',
        contextSentence:
          'Alpha-channel transparency is preserved losslessly when transcoding from the W3C Portable Network Graphics (PNG) specification.',
      },
    ],
  },
  'exif-metadata-remover': {
    leadIntro:
      'After scrubbing hidden camera serial numbers and GPS coordinates from your photos, you can',
    internalLinks: [
      {
        keywordAnchor: 'compress scrubbed photos to 20KB, 50KB, or 100KB',
        toolId: 'compress-image-to-kb',
        href: '/image-tools/compress-image-to-kb/',
        contextAfter: 'for portal uploads,',
      },
      {
        keywordAnchor: 'clean hidden author and XMP metadata from PDFs',
        toolId: 'pdf-metadata-cleaner',
        href: '/pdf-tools/pdf-metadata-cleaner/',
        contextAfter: 'for complete document hygiene, or',
      },
      {
        keywordAnchor: 'batch convert clean images to WebP',
        toolId: 'bulk-webp-avif-converter',
        href: '/image-tools/bulk-webp-avif-converter/',
        contextAfter: 'before publishing to your CMS.',
      },
    ],
    externalLinks: [
      {
        keywordAnchor: 'CIPA EXIF 2.32 Exchangeable Image File Format standard',
        url: 'https://www.cipa.jp/std/documents/download_e.html?DC-008-Translation-2023-E',
        sourceName: 'CIPA Standards',
        contextSentence:
          'Our parser inspects APP1 markers and TIFF IFD pointers defined by the CIPA EXIF 2.32 Exchangeable Image File Format standard.',
      },
      {
        keywordAnchor: 'OWASP Top 10 privacy and data exposure guidelines',
        url: 'https://owasp.org/www-project-top-ten/',
        sourceName: 'OWASP Foundation',
        contextSentence:
          'Removing embedded geolocation tags before public sharing prevents unintentional data leakage outlined in OWASP Top 10 privacy and data exposure guidelines.',
      },
    ],
  },
  'social-media-image-resizer': {
    leadIntro:
      'Once your graphics are resized to exact social media, YouTube, or e-commerce dimensions, you can',
    internalLinks: [
      {
        keywordAnchor: 'compress resized images to a strict KB target',
        toolId: 'compress-image-to-kb',
        href: '/image-tools/compress-image-to-kb/',
        contextAfter: 'without altering pixel dimensions,',
      },
      {
        keywordAnchor: 'convert resized assets to WebP in bulk',
        toolId: 'bulk-webp-avif-converter',
        href: '/image-tools/bulk-webp-avif-converter/',
        contextAfter: 'for faster storefront loading, or',
      },
      {
        keywordAnchor: 'generate a custom vector QR code',
        toolId: 'custom-qr-code-generator',
        href: '/generators/custom-qr-code-generator/',
        contextAfter: 'to overlay on your promotional banners.',
      },
    ],
    externalLinks: [
      {
        keywordAnchor: 'MDN Responsive Images and Aspect Ratio guide',
        url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images',
        sourceName: 'MDN Web Docs',
        contextSentence:
          'Proper intrinsic width and height sizing prevents Cumulative Layout Shift (CLS) as detailed in the MDN Responsive Images and Aspect Ratio guide.',
      },
      {
        keywordAnchor: 'Google Search Central Google Images SEO best practices',
        url: 'https://developers.google.com/search/docs/appearance/google-images',
        sourceName: 'Google Search Central',
        contextSentence:
          'Exporting standard 16:9, 4:3, and 1:1 aspect ratios improves Google Discover eligibility per Google Search Central Google Images SEO best practices.',
      },
    ],
  },
  'image-to-text-ocr': {
    leadIntro:
      'After extracting text from screenshots, scanned receipts, or whiteboard photos, you can pipe the recognized text directly to',
    internalLinks: [
      {
        keywordAnchor: 'clean OCR formatting and export to Markdown or TXT',
        toolId: 'text-to-txt-markdown',
        href: '/text-tools/text-to-txt-markdown/',
        contextAfter: 'with normalized line endings,',
      },
      {
        keywordAnchor: 'analyze word count and SEO keyword density',
        toolId: 'word-counter-density',
        href: '/text-tools/word-counter-density/',
        contextAfter: 'on the extracted passage, or',
      },
      {
        keywordAnchor: 'convert PDF pages to high-DPI images first',
        toolId: 'pdf-to-image',
        href: '/pdf-tools/pdf-to-image/',
        contextAfter: 'if your source is a scanned PDF document.',
      },
    ],
    externalLinks: [
      {
        keywordAnchor: 'Tesseract Open Source OCR Engine documentation',
        url: 'https://tesseract-ocr.github.io/',
        sourceName: 'Tesseract OCR',
        contextSentence:
          'Optical character recognition builds upon LSTM neural line recognition principles documented in the Tesseract Open Source OCR Engine documentation.',
      },
      {
        keywordAnchor: 'W3C Clipboard API and events specification',
        url: 'https://www.w3.org/TR/clipboard-apis/',
        sourceName: 'W3C Standards',
        contextSentence:
          'Instant Ctrl+V screenshot pasting is powered by the W3C Clipboard API and events specification.',
      },
    ],
  },
  'json-formatter-validator': {
    leadIntro:
      'When inspecting API responses or repairing broken LLM JSON outputs, you can chain your formatted payload to',
    internalLinks: [
      {
        keywordAnchor: 'count LLM tokens and estimate API context costs',
        toolId: 'llm-token-counter',
        href: '/dev-tools/llm-token-counter/',
        contextAfter: 'for your JSON schema,',
      },
      {
        keywordAnchor: 'compare two JSON payloads with the Code Diff Checker',
        toolId: 'code-diff-checker',
        href: '/dev-tools/code-diff-checker/',
        contextAfter: 'to spot structural changes, or',
      },
      {
        keywordAnchor: 'decode Base64 or URL-encoded JSON strings',
        toolId: 'base64-url-encoder',
        href: '/dev-tools/base64-url-encoder/',
        contextAfter: 'from query parameters and webhooks.',
      },
    ],
    externalLinks: [
      {
        keywordAnchor: 'IETF RFC 8259 JSON Data Interchange Format standard',
        url: 'https://datatracker.ietf.org/doc/html/rfc8259',
        sourceName: 'IETF Datatracker',
        contextSentence:
          'Syntax validation enforces strict grammar rules defined by the IETF RFC 8259 JSON Data Interchange Format standard.',
      },
      {
        keywordAnchor: 'MDN JSON.parse() specification and error reference',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse',
        sourceName: 'MDN Web Docs',
        contextSentence:
          'Line-and-column diagnostics map directly to the native MDN JSON.parse() specification and error reference.',
      },
    ],
  },
  'llm-token-counter': {
    leadIntro:
      'To optimize your prompt engineering and repository context packing workflow, pair this calculator with tools to',
    internalLinks: [
      {
        keywordAnchor: 'minify and validate JSON tool-call schemas',
        toolId: 'json-formatter-validator',
        href: '/dev-tools/json-formatter-validator/',
        contextAfter: 'to reduce prompt token overhead,',
      },
      {
        keywordAnchor: 'strip zero-width characters and clean Markdown text',
        toolId: 'text-to-txt-markdown',
        href: '/text-tools/text-to-txt-markdown/',
        contextAfter: 'before sending prompts to an LLM, or',
      },
      {
        keywordAnchor: 'deduplicate repetitive log lines and lists',
        toolId: 'duplicate-line-remover',
        href: '/text-tools/duplicate-line-remover/',
        contextAfter: 'to shrink context window usage.',
      },
    ],
    externalLinks: [
      {
        keywordAnchor: 'Google Gemini API token counting documentation',
        url: 'https://ai.google.dev/gemini-api/docs/tokens',
        sourceName: 'Google AI for Developers',
        contextSentence:
          'Context window budgeting and token-to-character heuristics reference the Google Gemini API token counting documentation.',
      },
      {
        keywordAnchor: 'OpenAI Byte-Pair Encoding (BPE) tokenization guide',
        url: 'https://platform.openai.com/docs/guides/text-generation',
        sourceName: 'OpenAI Platform Docs',
        contextSentence:
          'Subword token estimation aligns with modern cl100k_base and o200k_base vocabularies described in the OpenAI Byte-Pair Encoding (BPE) tokenization guide.',
      },
    ],
  },
  'regex-tester': {
    leadIntro:
      'While crafting and debugging regular expressions for validation or scraping, you can also',
    internalLinks: [
      {
        keywordAnchor: 'clean and deduplicate matched text lines',
        toolId: 'duplicate-line-remover',
        href: '/text-tools/duplicate-line-remover/',
        contextAfter: 'in one click,',
      },
      {
        keywordAnchor: 'validate structured JSON extracted by your regex',
        toolId: 'json-formatter-validator',
        href: '/dev-tools/json-formatter-validator/',
        contextAfter: 'for downstream APIs, or',
      },
      {
        keywordAnchor: 'compare before-and-after regex replacements',
        toolId: 'code-diff-checker',
        href: '/dev-tools/code-diff-checker/',
        contextAfter: 'using a line-by-line unified diff.',
      },
    ],
    externalLinks: [
      {
        keywordAnchor: 'MDN Regular Expressions (RegExp) syntax guide',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions',
        sourceName: 'MDN Web Docs',
        contextSentence:
          'Lookaheads, character classes, and flag behaviors match the official MDN Regular Expressions (RegExp) syntax guide.',
      },
      {
        keywordAnchor: 'ECMA-262 ECMAScript RegExp grammar specification',
        url: 'https://tc39.es/ecma262/#sec-patterns',
        sourceName: 'TC39 ECMA-262',
        contextSentence:
          'AST token explanations follow the normative ECMA-262 ECMAScript RegExp grammar specification.',
      },
    ],
  },
  'jwt-decoder': {
    leadIntro:
      'When auditing authentication flows and OAuth bearer tokens locally, you can combine this inspector with utilities to',
    internalLinks: [
      {
        keywordAnchor: 'convert Unix exp and iat epoch timestamps to local timezones',
        toolId: 'unix-timestamp-converter',
        href: '/generators/unix-timestamp-converter/',
        contextAfter: 'for incident debugging,',
      },
      {
        keywordAnchor: 'generate cryptographically secure 256-bit JWT signing secrets',
        toolId: 'password-api-key-generator',
        href: '/generators/password-api-key-generator/',
        contextAfter: 'using Web Crypto CSPRNG, or',
      },
      {
        keywordAnchor: 'encode and decode Base64Url strings',
        toolId: 'base64-url-encoder',
        href: '/dev-tools/base64-url-encoder/',
        contextAfter: 'for custom header inspection.',
      },
    ],
    externalLinks: [
      {
        keywordAnchor: 'IETF RFC 7519 JSON Web Token (JWT) standard',
        url: 'https://datatracker.ietf.org/doc/html/rfc7519',
        sourceName: 'IETF Datatracker',
        contextSentence:
          'Registered claim names (iss, sub, aud, exp, nbf, iat, jti) are parsed according to the IETF RFC 7519 JSON Web Token (JWT) standard.',
      },
      {
        keywordAnchor: 'OWASP JSON Web Token Security Cheat Sheet',
        url: 'https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html',
        sourceName: 'OWASP Foundation',
        contextSentence:
          'Inspecting tokens offline in browser memory prevents credential leakage recommended against in the OWASP JSON Web Token Security Cheat Sheet.',
      },
    ],
  },
  'code-diff-checker': {
    leadIntro:
      'Before committing configuration changes or merging pull requests, pair this diff viewer with tools to',
    internalLinks: [
      {
        keywordAnchor: 'format and canonicalize JSON files before diffing',
        toolId: 'json-formatter-validator',
        href: '/dev-tools/json-formatter-validator/',
        contextAfter: 'so key ordering matches,',
      },
      {
        keywordAnchor: 'sort and deduplicate configuration lines',
        toolId: 'duplicate-line-remover',
        href: '/text-tools/duplicate-line-remover/',
        contextAfter: 'to isolate real changes, or',
      },
      {
        keywordAnchor: 'normalize CRLF and LF line endings in text files',
        toolId: 'text-to-txt-markdown',
        href: '/text-tools/text-to-txt-markdown/',
        contextAfter: 'to prevent false-positive diffs.',
      },
    ],
    externalLinks: [
      {
        keywordAnchor: 'GNU Diffutils Unified Format specification',
        url: 'https://www.gnu.org/software/diffutils/manual/html_node/Unified-Format.html',
        sourceName: 'GNU.org',
        contextSentence:
          'Exported patch headers and hunk ranges follow the standard GNU Diffutils Unified Format specification.',
      },
      {
        keywordAnchor: 'Git git-diff patch documentation',
        url: 'https://git-scm.com/docs/git-diff',
        sourceName: 'Git SCM Docs',
        contextSentence:
          'Generated .patch files are directly compatible with git apply as defined in the Git git-diff patch documentation.',
      },
    ],
  },
  'base64-url-encoder': {
    leadIntro:
      'When decoding data URIs, query strings, or webhook payloads, you can pipe the decoded output directly to',
    internalLinks: [
      {
        keywordAnchor: 'format and validate decoded JSON payloads',
        toolId: 'json-formatter-validator',
        href: '/dev-tools/json-formatter-validator/',
        contextAfter: 'with syntax repair,',
      },
      {
        keywordAnchor: 'inspect decoded JWT header and payload claims',
        toolId: 'jwt-decoder',
        href: '/dev-tools/jwt-decoder/',
        contextAfter: 'for authentication debugging, or',
      },
      {
        keywordAnchor: 'scrub invisible Unicode characters from decoded text',
        toolId: 'text-to-txt-markdown',
        href: '/text-tools/text-to-txt-markdown/',
        contextAfter: 'before storing in a database.',
      },
    ],
    externalLinks: [
      {
        keywordAnchor: 'IETF RFC 4648 Base64 and Base64Url Data Encodings',
        url: 'https://datatracker.ietf.org/doc/html/rfc4648',
        sourceName: 'IETF Datatracker',
        contextSentence:
          'Alphabet mapping and padding rules implement the IETF RFC 4648 Base64 and Base64Url Data Encodings specification.',
      },
      {
        keywordAnchor: 'IETF RFC 3986 URI Percent-Encoding specification',
        url: 'https://datatracker.ietf.org/doc/html/rfc3986',
        sourceName: 'IETF Datatracker',
        contextSentence:
          'URL component escaping adheres to reserved character rules in the IETF RFC 3986 URI Percent-Encoding specification.',
      },
    ],
  },
  'word-counter-density': {
    leadIntro:
      'To polish your article draft for both human readers and search engines, combine this analyzer with utilities to',
    internalLinks: [
      {
        keywordAnchor: 'generate clean, stop-word stripped SEO URL slugs',
        toolId: 'case-converter-slug-generator',
        href: '/text-tools/case-converter-slug-generator/',
        contextAfter: 'from your H1 headline,',
      },
      {
        keywordAnchor: 'remove ChatGPT zero-width watermarks and smart quotes',
        toolId: 'text-to-txt-markdown',
        href: '/text-tools/text-to-txt-markdown/',
        contextAfter: 'before publishing to WordPress or Ghost, or',
      },
      {
        keywordAnchor: 'estimate LLM token counts for your article',
        toolId: 'llm-token-counter',
        href: '/dev-tools/llm-token-counter/',
        contextAfter: 'when summarizing or translating content.',
      },
    ],
    externalLinks: [
      {
        keywordAnchor: 'Google Search Essentials helpful content guidelines',
        url: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content',
        sourceName: 'Google Search Central',
        contextSentence:
          'Monitoring 1-gram, 2-gram, and 3-gram phrase frequency helps maintain natural prose that satisfies Google Search Essentials helpful content guidelines.',
      },
      {
        keywordAnchor: 'Google Search Central title link and SERP snippet documentation',
        url: 'https://developers.google.com/search/docs/appearance/title-link',
        sourceName: 'Google Search Central',
        contextSentence:
          'Our 580px–600px SERP title meter reflects truncation thresholds documented in the Google Search Central title link and SERP snippet documentation.',
      },
    ],
  },
  'text-to-txt-markdown': {
    leadIntro:
      'After sanitizing invisible zero-width characters and converting rich text to clean Markdown or `.txt`, you can',
    internalLinks: [
      {
        keywordAnchor: 'audit word count and N-gram keyword density',
        toolId: 'word-counter-density',
        href: '/text-tools/word-counter-density/',
        contextAfter: 'on the cleaned draft,',
      },
      {
        keywordAnchor: 'convert headings into lowercase kebab-case URL slugs',
        toolId: 'case-converter-slug-generator',
        href: '/text-tools/case-converter-slug-generator/',
        contextAfter: 'for your CMS, or',
      },
      {
        keywordAnchor: 'compare original and sanitized text with the Diff Checker',
        toolId: 'code-diff-checker',
        href: '/dev-tools/code-diff-checker/',
        contextAfter: 'to verify every stripped character.',
      },
    ],
    externalLinks: [
      {
        keywordAnchor: 'CommonMark Markdown syntax specification',
        url: 'https://spec.commonmark.org/',
        sourceName: 'CommonMark.org',
        contextSentence:
          'Exported Markdown formatting conforms to the unambiguous CommonMark Markdown syntax specification.',
      },
      {
        keywordAnchor: 'Unicode Character Database (UCD) default ignorable code points',
        url: 'https://www.unicode.org/reports/tr44/',
        sourceName: 'Unicode Consortium',
        contextSentence:
          'Forensic watermark scrubbing targets U+200B, U+200C, U+200D, and U+FEFF defined in the Unicode Character Database (UCD) default ignorable code points.',
      },
    ],
  },
  'case-converter-slug-generator': {
    leadIntro:
      'While standardizing variable names or URL structures across a project, you can also',
    internalLinks: [
      {
        keywordAnchor: 'check SERP title pixel width and keyword density',
        toolId: 'word-counter-density',
        href: '/text-tools/word-counter-density/',
        contextAfter: 'for your page titles,',
      },
      {
        keywordAnchor: 'deduplicate and sort bulk URL slug lists',
        toolId: 'duplicate-line-remover',
        href: '/text-tools/duplicate-line-remover/',
        contextAfter: 'before importing into a sitemap, or',
      },
      {
        keywordAnchor: 'encode URL slugs and query parameters safely',
        toolId: 'base64-url-encoder',
        href: '/dev-tools/base64-url-encoder/',
        contextAfter: 'for internationalized routes.',
      },
    ],
    externalLinks: [
      {
        keywordAnchor: 'Google Search Central URL structure best practices',
        url: 'https://developers.google.com/search/docs/crawling-indexing/url-structure',
        sourceName: 'Google Search Central',
        contextSentence:
          'Hyphen-separated lowercase words (`kebab-case`) with stop words removed follow Google Search Central URL structure best practices.',
      },
      {
        keywordAnchor: 'Unicode Standard Annex #15 Normalization Forms (NFD)',
        url: 'https://unicode.org/reports/tr15/',
        sourceName: 'Unicode Consortium',
        contextSentence:
          'Accented Latin characters are transliterated cleanly using Unicode Standard Annex #15 Normalization Forms (NFD).',
      },
    ],
  },
  'duplicate-line-remover': {
    leadIntro:
      'Once your email lists, log files, or keyword exports are deduplicated and sorted, you can',
    internalLinks: [
      {
        keywordAnchor: 'convert cleaned lines into URL slugs or camelCase identifiers',
        toolId: 'case-converter-slug-generator',
        href: '/text-tools/case-converter-slug-generator/',
        contextAfter: 'in bulk,',
      },
      {
        keywordAnchor: 'filter lines using custom patterns in the Live Regex Tester',
        toolId: 'regex-tester',
        href: '/dev-tools/regex-tester/',
        contextAfter: 'for advanced log extraction, or',
      },
      {
        keywordAnchor: 'compare two lists side by side in the Code Diff Checker',
        toolId: 'code-diff-checker',
        href: '/dev-tools/code-diff-checker/',
        contextAfter: 'to see exactly which lines were removed.',
      },
    ],
    externalLinks: [
      {
        keywordAnchor: 'MDN JavaScript Set O(N) hash uniqueness specification',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set',
        sourceName: 'MDN Web Docs',
        contextSentence:
          'High-speed line deduplication leverages the native MDN JavaScript Set O(N) hash uniqueness specification.',
      },
      {
        keywordAnchor: 'Unicode Collation Algorithm (UCA) sorting standard',
        url: 'https://unicode.org/reports/tr10/',
        sourceName: 'Unicode Consortium',
        contextSentence:
          'Locale-aware alphabetical ordering follows the Unicode Collation Algorithm (UCA) sorting standard.',
      },
    ],
  },
  'custom-qr-code-generator': {
    leadIntro:
      'After generating a permanent, non-expiring SVG or high-DPI PNG QR code, you can',
    internalLinks: [
      {
        keywordAnchor: 'resize promotional banners and product labels',
        toolId: 'social-media-image-resizer',
        href: '/image-tools/social-media-image-resizer/',
        contextAfter: 'for print or social media,',
      },
      {
        keywordAnchor: 'embed your QR code image into a printable A4 PDF sheet',
        toolId: 'image-to-pdf',
        href: '/pdf-tools/image-to-pdf/',
        contextAfter: 'for office signage, or',
      },
      {
        keywordAnchor: 'generate a strong WPA2/WPA3 Wi-Fi password',
        toolId: 'password-api-key-generator',
        href: '/generators/password-api-key-generator/',
        contextAfter: 'before encoding a guest Wi-Fi QR matrix.',
      },
    ],
    externalLinks: [
      {
        keywordAnchor: 'ISO/IEC 18004 QR Code bar code symbology specification',
        url: 'https://www.iso.org/standard/62021.html',
        sourceName: 'ISO.org',
        contextSentence:
          'Matrix quiet zones, finder patterns, and Reed-Solomon error correction levels (L, M, Q, H) conform to the ISO/IEC 18004 QR Code bar code symbology specification.',
      },
      {
        keywordAnchor: 'W3C Scalable Vector Graphics (SVG 2) recommendation',
        url: 'https://www.w3.org/TR/SVG2/',
        sourceName: 'W3C Standards',
        contextSentence:
          'Resolution-independent vector output is generated according to the W3C Scalable Vector Graphics (SVG 2) recommendation.',
      },
    ],
  },
  'password-api-key-generator': {
    leadIntro:
      'When provisioning credentials, bearer secrets, or database keys, you can also use our developer utilities to',
    internalLinks: [
      {
        keywordAnchor: 'inspect and debug JWT token claims and expiration times',
        toolId: 'jwt-decoder',
        href: '/dev-tools/jwt-decoder/',
        contextAfter: 'offline,',
      },
      {
        keywordAnchor: 'encode API keys into Base64 or URL-safe headers',
        toolId: 'base64-url-encoder',
        href: '/dev-tools/base64-url-encoder/',
        contextAfter: 'for HTTP Basic Auth, or',
      },
      {
        keywordAnchor: 'create a scannable Wi-Fi QR code from your generated password',
        toolId: 'custom-qr-code-generator',
        href: '/generators/custom-qr-code-generator/',
        contextAfter: 'for guest network access.',
      },
    ],
    externalLinks: [
      {
        keywordAnchor: 'W3C Web Cryptography API (crypto.getRandomValues)',
        url: 'https://www.w3.org/TR/WebCryptoAPI/',
        sourceName: 'W3C Standards',
        contextSentence:
          'Every character and byte is sampled from hardware-seeded OS entropy via the W3C Web Cryptography API (crypto.getRandomValues).',
      },
      {
        keywordAnchor: 'NIST SP 800-63B Digital Identity & Memorized Secret Guidelines',
        url: 'https://pages.nist.gov/800-63-3/sp800-63b.html',
        sourceName: 'NIST.gov',
        contextSentence:
          'Passphrase length and entropy recommendations align with NIST SP 800-63B Digital Identity & Memorized Secret Guidelines.',
      },
    ],
  },
  'unix-timestamp-converter': {
    leadIntro:
      'When correlating server logs, database records, or authentication expirations across regions, you can',
    internalLinks: [
      {
        keywordAnchor: 'decode JWT exp, iat, and nbf claims directly',
        toolId: 'jwt-decoder',
        href: '/dev-tools/jwt-decoder/',
        contextAfter: 'from bearer tokens,',
      },
      {
        keywordAnchor: 'schedule recurring jobs with the Cron Expression Studio',
        toolId: 'cron-expression-generator',
        href: '/generators/cron-expression-generator/',
        contextAfter: 'and preview the next 10 UTC trigger dates, or',
      },
      {
        keywordAnchor: 'format JSON log payloads containing epoch timestamps',
        toolId: 'json-formatter-validator',
        href: '/dev-tools/json-formatter-validator/',
        contextAfter: 'into readable tables.',
      },
    ],
    externalLinks: [
      {
        keywordAnchor: 'ISO 8601 Date and Time representation standard',
        url: 'https://www.iso.org/iso-8601-date-and-time-format.html',
        sourceName: 'ISO.org',
        contextSentence:
          'All human-readable UTC and local offset strings are formatted according to the ISO 8601 Date and Time representation standard.',
      },
      {
        keywordAnchor: 'IANA Time Zone Database (tzdata) registry',
        url: 'https://www.iana.org/time-zones',
        sourceName: 'IANA.org',
        contextSentence:
          'Daylight saving transitions and regional offsets use the official IANA Time Zone Database (tzdata) registry via Intl.DateTimeFormat.',
      },
    ],
  },
  'cron-expression-generator': {
    leadIntro:
      'When configuring automated backups, CI/CD pipelines, or cloud cron triggers, you can pair this schedule builder with tools to',
    internalLinks: [
      {
        keywordAnchor: 'convert upcoming UTC execution times to Unix epoch timestamps',
        toolId: 'unix-timestamp-converter',
        href: '/generators/unix-timestamp-converter/',
        contextAfter: 'across global timezones,',
      },
      {
        keywordAnchor: 'generate secure API keys for scheduled webhook jobs',
        toolId: 'password-api-key-generator',
        href: '/generators/password-api-key-generator/',
        contextAfter: 'in one click, or',
      },
      {
        keywordAnchor: 'validate JSON configuration files for your scheduler',
        toolId: 'json-formatter-validator',
        href: '/dev-tools/json-formatter-validator/',
        contextAfter: 'before deploying.',
      },
    ],
    externalLinks: [
      {
        keywordAnchor: 'IEEE POSIX.1 crontab schedule specification',
        url: 'https://pubs.opengroup.org/onlinepubs/9699919799/utilities/crontab.html',
        sourceName: 'The Open Group / POSIX',
        contextSentence:
          'Five-field syntax (`minute hour day-of-month month day-of-week`) conforms to the IEEE POSIX.1 crontab schedule specification.',
      },
      {
        keywordAnchor: 'Linux man-pages crontab(5) reference documentation',
        url: 'https://man7.org/linux/man-pages/man5/crontab.5.html',
        sourceName: 'man7.org',
        contextSentence:
          'Step values (`*/n`), ranges, and comma-separated lists follow standard behavior defined in the Linux man-pages crontab(5) reference documentation.',
      },
    ],
  },
};
