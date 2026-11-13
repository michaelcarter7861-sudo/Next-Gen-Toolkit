/**
 * @license
 * SPDX-License-Identifier: MIT
 *
 * Utilix Master 25-Tool Catalog + SEO / AEO / GEO Metadata Matrix
 * Implements Sections 6, 7, 8, 9, and 10 of the Utilix Master Blueprint PDF.
 */

export type HubId = 'pdf-tools' | 'image-tools' | 'dev-tools' | 'text-tools' | 'generators';

export interface HubDefinition {
  id: HubId;
  slug: string;
  name: string;
  shortTitle: string;
  description: string;
  accentBg: string;
  accentFg: string;
  iconName: 'FileText' | 'Image' | 'Code2' | 'Type' | 'Calculator';
  subFilters: string[];
}

export interface ToolDefinition {
  id: string;
  hubId: HubId;
  slug: string;
  canonicalPath: string;
  name: string;
  shortDesc: string;
  primaryKeyword: string;
  valuePropSubtitle: string;
  subCategory: string;
  popular?: boolean;
  nextStepToolId: string;
  nextStepPrompt: string;
  // GEO & AEO 9-Zone Content
  entityLeadSentence: string;
  aeoQuestionHeading: string;
  aeoSummaryParagraph: string;
  howToSteps: { name: string; text: string }[];
  lsiKeywords: string[];
  clusteredQueries: string[];
  specTable: {
    supportedFormats: string;
    maxFileCapacity: string;
    executionEngine: string;
    privacyModel: string;
    batchSupport: string;
  };
  faqs: { q: string; a: string }[];
}

export const HUBS: HubDefinition[] = [
  {
    id: 'text-tools',
    slug: '/text-tools/',
    name: 'Text Tools',
    shortTitle: 'Text',
    description: 'Edit, convert, sanitize, and analyze text & SEO density locally.',
    accentBg: '#EDE7FF',
    accentFg: '#6D28D9',
    iconName: 'Type',
    subFilters: ['All Tools', 'Convert', 'Analyze', 'Clean', 'SEO'],
  },
  {
    id: 'image-tools',
    slug: '/image-tools/',
    name: 'Image Tools',
    shortTitle: 'Images',
    description: 'A complete collection of image utilities to compress, resize, convert and optimize your images.',
    accentBg: '#E1F0FF',
    accentFg: '#1D4ED8',
    iconName: 'Image',
    subFilters: ['All Tools', 'Compress', 'Resize', 'Convert', 'OCR', 'Optimize'],
  },
  {
    id: 'pdf-tools',
    slug: '/pdf-tools/',
    name: 'PDF Tools',
    shortTitle: 'PDF',
    description: 'Merge, split, compress to exact KB, convert, and scrub PDF files 100% offline.',
    accentBg: '#FFE7EC',
    accentFg: '#E11D48',
    iconName: 'FileText',
    subFilters: ['All Tools', 'Compress', 'Merge', 'Split', 'Convert', 'Privacy'],
  },
  {
    id: 'dev-tools',
    slug: '/dev-tools/',
    name: 'Developer Tools',
    shortTitle: 'Developer',
    description: 'Format, auto-fix JSON, count LLM tokens, test Regex, decode JWTs, and diff code.',
    accentBg: '#E0F7F0',
    accentFg: '#047857',
    iconName: 'Code2',
    subFilters: ['All Tools', 'Format', 'AI Tokens', 'Regex', 'Security', 'Diff'],
  },
  {
    id: 'generators',
    slug: '/generators/',
    name: 'Calculators & Generators',
    shortTitle: 'Calculators',
    description: 'Everyday cryptographic generators, vector QR studio, epoch time, and cron schedulers.',
    accentBg: '#FFF1D9',
    accentFg: '#D97706',
    iconName: 'Calculator',
    subFilters: ['All Tools', 'QR Code', 'Security', 'Time', 'Cron'],
  },
];

export const TOOLS_CATALOG: ToolDefinition[] = [
  // ==========================================================================
  // HUB 1: PDF TOOLS (6 Tools)
  // ==========================================================================
  {
    id: 'compress-pdf',
    hubId: 'pdf-tools',
    slug: 'compress-pdf',
    canonicalPath: '/pdf-tools/compress-pdf/',
    name: 'Offline PDF Compressor',
    shortDesc: 'Reduce PDF file size to exact KB targets without losing quality.',
    primaryKeyword: 'Compress PDF Online Free (100% Client-Side)',
    valuePropSubtitle: 'Shrink PDF files strictly under 100KB, 200KB, or 500KB inside your browser RAM with zero server uploads.',
    subCategory: 'Compress',
    popular: true,
    nextStepToolId: 'merge-pdf',
    nextStepPrompt: 'Need to combine multiple compressed PDFs? Send directly to PDF Merger →',
    entityLeadSentence:
      'Utilix Offline PDF Compressor is a free, 100% client-side web application that reduces PDF byte size to exact kilobyte targets (100KB, 200KB, 500KB) using WebAssembly and pdf-lib stream reconstruction with zero server data transmission.',
    aeoQuestionHeading: 'How to Compress a PDF Under 200KB Online Without Uploading?',
    aeoSummaryParagraph:
      'To compress a PDF under 200KB without uploading it to a cloud server, drop your PDF into the Utilix Offline PDF Compressor, slide the Target KB selector to 200KB, and export the reconstructed PDF stream directly from your browser memory.',
    howToSteps: [
      { name: 'Select or Drag PDF Files', text: 'Drop one or multiple PDF files into the Utilix workspace or click Load Sample Data.' },
      { name: 'Set Target KB Size Slider', text: 'Slide the target KB control to 100KB, 200KB, or 500KB for portal compliance.' },
      { name: 'Download Optimized PDF or Batch ZIP', text: 'Save your compressed PDF immediately or export all files in a single ZIP archive.' },
    ],
    lsiKeywords: ['DPI downsampling', 'lossless stream compression', 'WebAssembly PDF parser', 'client-side privacy', 'KB size target', 'metadata stripping'],
    clusteredQueries: ['compress pdf to 100kb', 'reduce pdf file size without losing quality', 'offline pdf compressor in browser no upload', 'shrink pdf for email'],
    specTable: {
      supportedFormats: 'PDF 1.3 – 2.0 (.pdf)',
      maxFileCapacity: 'Depends on available browser memory and input size',
      executionEngine: 'pdf-lib Object Stream Reconstruction + Canvas Downsampling',
      privacyModel: 'Zero-Knowledge / 0 Bytes Uploaded to Server',
      batchSupport: 'Multi-file queue with ZIP export; capacity depends on browser memory',
    },
    faqs: [
      { q: 'Does Utilix upload my confidential PDF to any server?', a: 'No. Every byte of your PDF is parsed and compressed locally inside your browser using JavaScript and WebAssembly. Network inspection verifies 0 bytes are transmitted.' },
      { q: 'How can I compress a PDF strictly under 100KB or 200KB for government portals?', a: 'Use the Target KB Slider in the settings panel to select 100KB or 200KB. Utilix strips redundant XMP packets, compresses object streams, and scales embedded vectors to meet portal limits.' },
      { q: 'Can I batch compress 20+ PDF files at once for free?', a: 'Yes. Utilix enforces zero paywalls or file count caps. Drop 20 or more PDFs and click Download All as ZIP.' },
      { q: 'Will compressing my PDF add watermarks?', a: 'Never. Utilix outputs clean, standards-compliant PDF documents with zero watermarks or sign-up gates.' },
      { q: 'Does offline PDF compression work on mobile and macOS Safari?', a: 'Yes, the engine uses standard ES6 ArrayBuffers supported across Chrome, Safari, Firefox, and Edge on desktop and mobile.' },
    ],
  },
  {
    id: 'merge-pdf',
    hubId: 'pdf-tools',
    slug: 'merge-pdf',
    canonicalPath: '/pdf-tools/merge-pdf/',
    name: 'PDF Merger & Page Organizer',
    shortDesc: 'Combine multiple PDF files into one document offline.',
    primaryKeyword: 'Merge PDF Files Online Free (No Upload)',
    valuePropSubtitle: 'Combine multiple PDFs, reorder files, and rotate pages locally in your browser without watermarks.',
    subCategory: 'Merge',
    popular: true,
    nextStepToolId: 'compress-pdf',
    nextStepPrompt: 'Need a smaller merged PDF? Send result directly to Offline PDF Compressor →',
    entityLeadSentence:
      'Utilix PDF Merger & Page Organizer is a client-side document concatenation utility that joins multiple PDF files, rotates pages, and normalizes A4/Letter layouts locally in browser RAM using pdf-lib.',
    aeoQuestionHeading: 'How to Combine Multiple PDF Files Offline in Your Browser?',
    aeoSummaryParagraph:
      'You can merge multiple PDF documents without uploading them to third-party servers by dragging your files into Utilix PDF Merger, arranging their sequence, optionally setting page rotation, and clicking Merge PDFs to generate a unified file locally.',
    howToSteps: [
      { name: 'Drop Multiple PDF Files', text: 'Select two or more PDF files or click Load Sample Data to populate test documents.' },
      { name: 'Arrange Order & Rotation', text: 'Reorder files in the queue and choose optional 90°/180° rotation.' },
      { name: 'Export Unified PDF', text: 'Click Merge PDFs to download the concatenated document immediately.' },
    ],
    lsiKeywords: ['Page thumbnail sorting', 'document concatenation', 'byte buffer merging', 'zero server retention', 'encrypted PDF handling', 'A4 normalization'],
    clusteredQueries: ['combine pdf pages free no sign up', 'reorder pdf pages in browser', 'join multiple pdfs into one offline', 'merge pdf without watermark'],
    specTable: {
      supportedFormats: 'Multi-file PDF (.pdf)',
      maxFileCapacity: 'Depends on available browser memory and input size',
      executionEngine: 'pdf-lib copyPages() & Byte Buffer Concatenation',
      privacyModel: '100% Local Browser RAM (Zero Cloud Storage)',
      batchSupport: 'Multi-PDF Queue + Instant Unified Output',
    },
    faqs: [
      { q: 'Is it safe to merge legal or tax PDFs on Utilix?', a: 'Yes. Because merging runs via client-side pdf-lib inside your browser tab, sensitive tax, medical, or legal records never leave your device.' },
      { q: 'How many PDF files can I join at the same time?', a: 'There is no artificial limit. You can combine 2, 20, or 50+ PDF files in a single pass.' },
      { q: 'Does merging PDFs degrade text sharpness?', a: 'No. Utilix copies vector page trees directly without rasterizing text, preserving 100% vector crispness.' },
      { q: 'Can I rotate upside-down scans while merging?', a: 'Yes, use the Page Rotation selector (0°, 90°, 180°, 270°) to normalize orientation during concatenation.' },
      { q: 'Do I need to create an account?', a: 'No account, email, or credit card is ever required.' },
    ],
  },
  {
    id: 'split-pdf',
    hubId: 'pdf-tools',
    slug: 'split-pdf',
    canonicalPath: '/pdf-tools/split-pdf/',
    name: 'PDF Splitter & Extractor',
    shortDesc: 'Extract specific page ranges or split PDFs into individual files.',
    primaryKeyword: 'Split PDF Pages Online Free (Custom Ranges)',
    valuePropSubtitle: 'Extract custom page ranges (e.g., 1-3, 5, 8-10) locally with instant PDF or ZIP export.',
    subCategory: 'Split',
    nextStepToolId: 'pdf-metadata-cleaner',
    nextStepPrompt: 'Sharing extracted pages externally? Scrub hidden tags with PDF Metadata Cleaner →',
    entityLeadSentence:
      'Utilix PDF Splitter & Extractor is a browser-based PDF byte-range parser that extracts custom page intervals or bursts multi-page documents into standalone PDF files with zero server uploads.',
    aeoQuestionHeading: 'How to Extract Specific Pages from a PDF Without Adobe Acrobat?',
    aeoSummaryParagraph:
      'Drop your PDF into Utilix PDF Splitter, enter your desired page numbers or intervals using standard range syntax (such as 1-3, 5, 8-10), and click Split PDF to instantaneously generate a new PDF containing only those selected pages.',
    howToSteps: [
      { name: 'Load Source PDF', text: 'Upload a multi-page PDF document or click Load Sample Data.' },
      { name: 'Specify Page Range Syntax', text: 'Type custom ranges like "1-2, 4" or choose preset extraction rules.' },
      { name: 'Download Extracted PDF', text: 'Save the extracted pages as a clean standalone PDF document.' },
    ],
    lsiKeywords: ['PDF byte range extraction', 'page index slicing', 'pdf-lib document splitter', 'custom page intervals', 'zero-upload document burst'],
    clusteredQueries: ['extract pages from pdf free', 'split pdf by page numbers online', 'separate pdf pages in browser', 'cut pdf pages without uploading'],
    specTable: {
      supportedFormats: 'PDF (.pdf)',
      maxFileCapacity: 'Depends on document size and available browser memory',
      executionEngine: 'pdf-lib Page Index Slicer + JSZip',
      privacyModel: 'Zero-Knowledge / Local Browser Execution',
      batchSupport: 'Custom Range Syntax + Multi-File Queue',
    },
    faqs: [
      { q: 'What page range syntax is supported?', a: 'You can enter single pages, hyphenated ranges, or comma-separated combinations such as "1-3, 5, 8-10".' },
      { q: 'Are bookmarks or hidden metadata copied over?', a: 'Utilix builds a fresh PDF container for your extracted pages, keeping file size minimal and clean.' },
      { q: 'Does splitting work offline once the page loads?', a: 'Yes, you can disconnect from Wi-Fi and split PDFs completely offline.' },
      { q: 'Is vector text selectable in the split PDF?', a: 'Yes, 100% of vector fonts, links, and selectable text streams remain intact.' },
      { q: 'Can I extract a single page from a 500-page PDF?', a: 'Yes, extracting a single page takes less than 30 milliseconds in browser RAM.' },
    ],
  },
  {
    id: 'pdf-to-image',
    hubId: 'pdf-tools',
    slug: 'pdf-to-image',
    canonicalPath: '/pdf-tools/pdf-to-image/',
    name: 'PDF to High-Res Images',
    shortDesc: 'Render PDF pages to crisp PNG, JPG, or WebP at 150, 300, or 600 DPI.',
    primaryKeyword: 'Convert PDF to PNG, JPG & WebP High DPI',
    valuePropSubtitle: 'Rasterize PDF pages onto offscreen HTML5 Canvas at configurable 150, 300, or 600 DPI scales.',
    subCategory: 'Convert',
    nextStepToolId: 'compress-image-to-kb',
    nextStepPrompt: 'Need your exported images under 50KB? Open Target-KB Image Compressor →',
    entityLeadSentence:
      'Utilix PDF to High-Res Images is a client-side rasterization studio that converts PDF pages into PNG, JPEG, or WebP images at selectable 150, 300, or 600 DPI resolutions with 1-click ZIP archiving.',
    aeoQuestionHeading: 'How to Convert a PDF to 300 DPI or 600 DPI Images in Your Browser?',
    aeoSummaryParagraph:
      'Load your PDF into Utilix PDF to High-Res Images, select 300 DPI or 600 DPI along with your preferred format (PNG, JPG, or WebP), and export all rendered pages simultaneously as a single ZIP archive.',
    howToSteps: [
      { name: 'Drop PDF Document', text: 'Select a PDF file or load the built-in 4-page sample PDF.' },
      { name: 'Choose DPI & Image Format', text: 'Select 150, 300, or 600 DPI and pick PNG, JPG, or modern WebP.' },
      { name: 'Download Individual Pages or ZIP', text: 'Save individual high-res page images or click Download All as ZIP.' },
    ],
    lsiKeywords: ['OffscreenCanvas PDF rendering', '600 DPI PDF rasterizer', 'PDF to WebP batch converter', 'lossless PNG extraction', 'JSZip bulk download'],
    clusteredQueries: ['pdf to png 300 dpi online free', 'convert pdf pages to jpg without upload', 'pdf to webp converter bulk', 'high resolution pdf to image'],
    specTable: {
      supportedFormats: 'Input: PDF • Output: PNG, JPEG, WebP',
      maxFileCapacity: 'Depends on document size and available browser memory',
      executionEngine: 'HTML5 Canvas + pdf-lib Page Geometry + JSZip',
      privacyModel: '100% Local Browser Canvas',
      batchSupport: 'Multi-Page Simultaneous Export + ZIP',
    },
    faqs: [
      { q: 'What is the difference between 150, 300, and 600 DPI?', a: '150 DPI is ideal for fast web previews, 300 DPI is the industry standard for print and OCR, and 600 DPI preserves ultra-fine architectural or typographic detail.' },
      { q: 'Why export PDF pages to WebP instead of PNG?', a: 'WebP delivers comparable visual sharpness at 40% to 70% smaller byte sizes for web publishing.' },
      { q: 'Can I download all pages in one click?', a: 'Yes, click Download All as ZIP to bundle every rendered page into a single archive.' },
      { q: 'Are my PDF pages rendered on a remote server?', a: 'Never. Rendering uses your device GPU and HTML5 Canvas API locally.' },
      { q: 'Does it preserve page aspect ratios?', a: 'Yes, exact PDF point dimensions (such as A4 595x842 pt) are scaled proportionally.' },
    ],
  },
  {
    id: 'image-to-pdf',
    hubId: 'pdf-tools',
    slug: 'image-to-pdf',
    canonicalPath: '/pdf-tools/image-to-pdf/',
    name: 'Images to PDF Studio',
    shortDesc: 'Convert JPG, PNG, and WebP photos into A4 or Letter PDF documents.',
    primaryKeyword: 'Convert Images to PDF Free (JPG, PNG, WebP)',
    valuePropSubtitle: 'Embed multiple images into A4, Letter, or auto-fit PDF containers with margin, orientation, and page numbering controls.',
    subCategory: 'Convert',
    nextStepToolId: 'compress-pdf',
    nextStepPrompt: 'Want to shrink your newly created PDF? Open Offline PDF Compressor →',
    entityLeadSentence:
      'Utilix Images to PDF Studio is a client-side document builder that embeds PNG, JPEG, and WebP buffers into A4, Letter, or Fit-to-Image PDF containers with configurable margins and page numbering.',
    aeoQuestionHeading: 'How to Combine Multiple Photos into a Single A4 PDF Offline?',
    aeoSummaryParagraph:
      'Drag your PNG, JPG, or WebP images into Utilix Images to PDF Studio, configure page size (A4, Letter, or Auto-Fit), orientation, and margin padding, then click Build PDF to download a compiled document.',
    howToSteps: [
      { name: 'Select or Drop Images', text: 'Add one or multiple PNG, JPG, or WebP images to the workspace.' },
      { name: 'Configure Page Layout', text: 'Pick A4, Letter, or Fit-to-Image, Portrait/Landscape, margins, and footer numbering.' },
      { name: 'Generate & Download PDF', text: 'Click Build PDF to save your multi-page document locally.' },
    ],
    lsiKeywords: ['pdf-lib embedJpg', 'A4 PDF container', 'auto-fit image aspect ratio', 'page numbering footer stamp', 'offline receipt to pdf'],
    clusteredQueries: ['combine jpg into one pdf offline', 'webp to pdf converter no upload', 'photos to a4 pdf with margins', 'free image to pdf studio'],
    specTable: {
      supportedFormats: 'Input: PNG, JPG, WebP • Output: PDF',
      maxFileCapacity: '50+ images per document',
      executionEngine: 'HTML5 Canvas Normalization + pdf-lib embedJpg()',
      privacyModel: 'Zero Server Upload / Browser RAM',
      batchSupport: 'Multi-Image Compilation into Single PDF',
    },
    faqs: [
      { q: 'Can I convert WebP images directly into a PDF?', a: 'Yes. Utilix automatically normalizes WebP, PNG, and JPEG buffers via HTML5 Canvas before embedding them into the PDF container.' },
      { q: 'How do I prevent my images from being stretched?', a: 'Utilix calculates aspect-ratio bounding boxes automatically so images are centered proportionally within your chosen margins.' },
      { q: 'Can I add "Page X of Y" footers automatically?', a: 'Yes, toggle "Stamp Page Numbers" in the settings panel to print clean footer pagination on every page.' },
      { q: 'What is "Fit-to-Image" page size?', a: 'Fit-to-Image sets each PDF page dimension to match the exact pixel dimensions of that photo with zero white letterboxing.' },
      { q: 'Are there any watermarks added to the pages?', a: 'No watermarks or promotional footers are ever added.' },
    ],
  },
  {
    id: 'pdf-metadata-cleaner',
    hubId: 'pdf-tools',
    slug: 'pdf-metadata-cleaner',
    canonicalPath: '/pdf-tools/pdf-metadata-cleaner/',
    name: 'PDF Metadata & Sanitizer',
    shortDesc: 'Inspect and strip hidden Author, Creator, Producer, and XMP tracking tags.',
    primaryKeyword: 'Remove PDF Metadata & Hidden Tracking Tags Online',
    valuePropSubtitle: 'Inspect a full forensic table of hidden PDF properties and scrub 100% of identifying metadata in one click.',
    subCategory: 'Privacy',
    nextStepToolId: 'compress-pdf',
    nextStepPrompt: 'Also want to reduce byte size? Send sanitized PDF to Offline PDF Compressor →',
    entityLeadSentence:
      'Utilix PDF Metadata & Sanitizer is a forensic privacy tool that inspects and strips hidden Info dictionary keys (Author, Creator, Producer, CreationDate) and XMP tracking packets from PDF files locally in the browser.',
    aeoQuestionHeading: 'How to Check and Remove Hidden Author Metadata from a PDF?',
    aeoSummaryParagraph:
      'Drop your PDF into Utilix PDF Metadata & Sanitizer to immediately view a forensic table of embedded Author, Creator, software Producer, and timestamp tags, then download a 100% scrubbed copy with all identifying fields wiped clean.',
    howToSteps: [
      { name: 'Drop PDF for Forensic Scan', text: 'Load any PDF or click Load Sample Data to inspect embedded metadata fields.' },
      { name: 'Review Forensic Metadata Table', text: 'Examine hidden Author, Creator, Producer, Keywords, and modification timestamps.' },
      { name: 'Download Scrubbed PDF', text: 'Click Download Sanitized PDF to save a clean copy with all metadata cleared.' },
    ],
    lsiKeywords: ['XMP packet scrubber', 'PDF Info dictionary', 'remove PDF author name', 'forensic document sanitization', 'anonymous PDF publishing'],
    clusteredQueries: ['strip metadata from pdf online free', 'view hidden pdf properties in browser', 'remove creator and author from pdf', 'sanitize pdf before sharing'],
    specTable: {
      supportedFormats: 'PDF 1.0 – 2.0 (.pdf)',
      maxFileCapacity: 'Depends on document size and available browser memory',
      executionEngine: 'pdf-lib Info Dictionary & Stream Sanitizer',
      privacyModel: '100% Client-Side Forensic Scrubbing',
      batchSupport: 'Multi-PDF Sanitization + ZIP Export',
    },
    faqs: [
      { q: 'What hidden data does a standard PDF file leak?', a: 'Most PDFs leak the author username, organization, exact operating system, Word/Acrobat version, creation timestamp, edit history duration, and XMP document IDs.' },
      { q: 'Does scrubbing metadata alter the visible text or layout of my PDF?', a: 'No. Only the non-visual Info dictionary and XMP metadata streams are wiped; visual pages remain 100% identical.' },
      { q: 'Can I verify that the metadata was actually removed?', a: 'Yes, re-drop the sanitized PDF into the tool to confirm every forensic field reads empty.' },
      { q: 'Why use a client-side metadata cleaner instead of a cloud site?', a: 'Uploading a confidential document to a remote server just to remove privacy tags defeats the entire purpose of document privacy.' },
      { q: 'Does this support batch PDF scrubbing?', a: 'Yes, drop multiple PDFs and export all scrubbed files as a single ZIP.' },
    ],
  },

  // ==========================================================================
  // HUB 2: IMAGE TOOLS (5 Tools)
  // ==========================================================================
  {
    id: 'compress-image-to-kb',
    hubId: 'image-tools',
    slug: 'compress-image-to-kb',
    canonicalPath: '/image-tools/compress-image-to-kb/',
    name: 'Image Compressor (Target-KB)',
    shortDesc: 'Reduce image file size to exact 20KB, 50KB, or 100KB limits without losing quality.',
    primaryKeyword: 'Compress Image to Exact KB (20KB, 50KB, 100KB)',
    valuePropSubtitle: 'Compress your images while preserving visual quality using a binary-search quality loop in your browser.',
    subCategory: 'Compress',
    popular: true,
    nextStepToolId: 'exif-metadata-remover',
    nextStepPrompt: 'Uploading to a public portal? Scrub GPS & camera tags in EXIF Privacy Scrubber →',
    entityLeadSentence:
      'Utilix Target-KB Image Compressor is a client-side photo optimization tool that uses an iterative binary-search quantization loop on HTML5 Canvas to shrink JPG, PNG, and WebP images strictly under 20KB, 50KB, or 100KB.',
    aeoQuestionHeading: 'How to Compress a Photo to Exactly 20KB or 50KB for Portal Forms?',
    aeoSummaryParagraph:
      'Select your photo in Utilix Target-KB Image Compressor, pick a preset target (20KB, 50KB, or 100KB) or adjust the quality slider, and download a byte-verified JPEG that meets strict government, visa, and university admission portal rules.',
    howToSteps: [
      { name: 'Select Your Image(s)', text: 'Drop JPG, PNG, or WebP files into the workspace or click Load Sample Data.' },
      { name: 'Choose Compression Quality or Target KB', text: 'Pick 20KB, 50KB, 100KB, or dial in the exact quality slider.' },
      { name: 'Click Compress & Download', text: 'Download your optimized image or export the entire batch as a ZIP.' },
    ],
    lsiKeywords: ['Quantization table', 'chroma subsampling', 'EXIF header removal', 'pixel dimensions vs byte size', 'JPEG quality factor', 'passport photo specs'],
    clusteredQueries: ['reduce jpg size under 50kb online', 'compress photo to 20kb for form upload', 'resize signature and photo for job application'],
    specTable: {
      supportedFormats: 'JPG, PNG, WebP (Max 50 MB per file)',
      maxFileCapacity: 'Depends on available browser memory and input size',
      executionEngine: 'Binary-Search Canvas Quality Iteration Loop',
      privacyModel: '100% In-Browser Processing (Zero Upload)',
      batchSupport: 'Multi-Image Queue + 1-Click ZIP Export',
    },
    faqs: [
      { q: 'How does Utilix hit an exact 20KB or 50KB limit?', a: 'Instead of guessing a single quality percentage, Utilix runs an 8-step binary search across JPEG quantization levels in browser RAM until the output Blob is strictly below your target KB.' },
      { q: 'Are my passport or visa photos uploaded to any server?', a: 'Never. Identity photos and signatures are processed strictly inside your local browser memory.' },
      { q: 'Does compressing strip heavy EXIF camera thumbnails?', a: 'Yes, Canvas re-encoding automatically drops bloated embedded camera previews and ICC profiles so more bytes go toward visible sharpness.' },
      { q: 'Can I compress PNG and WebP files too?', a: 'Yes, any PNG, WebP, or JPEG input is accepted and optimized.' },
      { q: 'How many photos can I compress at once?', a: 'You can drop 10, 20, or 50+ photos simultaneously and download them all as a single ZIP.' },
    ],
  },
  {
    id: 'bulk-webp-avif-converter',
    hubId: 'image-tools',
    slug: 'bulk-webp-avif-converter',
    canonicalPath: '/image-tools/bulk-webp-avif-converter/',
    name: 'Bulk WebP & Format Converter',
    shortDesc: 'Convert JPG, PNG and WebP images with batch export.',
    primaryKeyword: 'Bulk WebP & Image Format Converter (No Limit)',
    valuePropSubtitle: 'Batch transcode PNG and JPG images into high-efficiency WebP or standard formats for Core Web Vitals.',
    subCategory: 'Convert',
    nextStepToolId: 'social-media-image-resizer',
    nextStepPrompt: 'Need responsive social aspect ratios? Send to Social & E-Com Bulk Resizer →',
    entityLeadSentence:
      'Utilix Bulk WebP & Format Converter is a high-speed client-side image transcoder that converts PNG, JPEG, and WebP files using HTML5 Canvas codecs. Practical batch limits depend on browser memory and input size.',
    aeoQuestionHeading: 'How to Batch Convert PNG and JPG to WebP for Faster Core Web Vitals?',
    aeoSummaryParagraph:
      'Drop your folder of PNG or JPG assets into the Utilix Bulk WebP Converter, set the quality slider (e.g., 82%), and download all converted next-gen WebP files in a single ZIP archive with zero upload wait time.',
    howToSteps: [
      { name: 'Drop Image Batch', text: 'Drag dozens of PNG or JPG images into the dropzone or load a sample photo.' },
      { name: 'Select Output Format & Quality', text: 'Choose WebP, PNG, or JPEG and adjust the compression quality slider.' },
      { name: 'Export All as ZIP', text: 'Review total bandwidth saved and download all converted files in one click.' },
    ],
    lsiKeywords: ['Next-gen image formats', 'lossy vs lossless compression', 'alpha channel transparency', 'Largest Contentful Paint (LCP)', 'MIME type transcoding'],
    clusteredQueries: ['convert png to webp bulk free', 'jpg to webp converter online no limit', 'batch convert images for core web vitals', 'local image converter'],
    specTable: {
      supportedFormats: 'PNG, JPEG, WebP (Alpha transparency preserved)',
      maxFileCapacity: '50+ images simultaneously',
      executionEngine: 'HTML5 Canvas Native MIME Transcoder + JSZip',
      privacyModel: '100% Client-Side RAM Execution',
      batchSupport: 'Multi-file queue and ZIP export; capacity depends on browser memory',
    },
    faqs: [
      { q: 'Why does Google PageSpeed Insights recommend WebP?', a: 'WebP reduces image payload sizes by 30%–65% compared to legacy PNG and JPEG, directly improving Largest Contentful Paint (LCP).' },
      { q: 'Does PNG to WebP conversion preserve transparent backgrounds?', a: 'Yes, HTML5 Canvas WebP encoding preserves full 8-bit alpha channel transparency.' },
      { q: 'Is there a 2-file or 5-file cap like other converter sites?', a: 'No. Because your own CPU performs the encoding, Utilix never restricts how many files you can convert.' },
      { q: 'Can I convert WebP back into JPG or PNG?', a: 'Yes, simply select JPEG or PNG in the Output Format selector.' },
      { q: 'How fast is browser-native WebP transcoding?', a: 'Most 2MP–4MP images transcode in under 35 milliseconds per image.' },
    ],
  },
  {
    id: 'exif-metadata-remover',
    hubId: 'image-tools',
    slug: 'exif-metadata-remover',
    canonicalPath: '/image-tools/exif-metadata-remover/',
    name: 'EXIF & GPS Privacy Scrubber',
    shortDesc: 'View and remove hidden camera, shutter, and GPS location metadata (EXIF).',
    primaryKeyword: 'EXIF Metadata Viewer & GPS Privacy Scrubber',
    valuePropSubtitle: 'Inspect hidden APP1/EXIF binary segments (GPS coordinates, camera model, shutter data) and scrub 100% clean copies.',
    subCategory: 'Optimize',
    nextStepToolId: 'compress-image-to-kb',
    nextStepPrompt: 'Need to shrink your scrubbed photo? Open Target-KB Image Compressor →',
    entityLeadSentence:
      'Utilix EXIF & GPS Privacy Scrubber is a browser-side binary image inspector that parses APP1/EXIF headers to reveal embedded GPS coordinates and device tags before re-encoding 100% metadata-free pixel copies.',
    aeoQuestionHeading: 'How to Remove GPS Location and EXIF Data from Photos Before Posting Online?',
    aeoSummaryParagraph:
      'Drop your photos into Utilix EXIF & GPS Privacy Scrubber to inspect embedded GPS latitude/longitude and camera serial tags in a forensic warning table, then download clean pixel-reconstructed copies with all APP1/XMP segments stripped.',
    howToSteps: [
      { name: 'Drop Photo for Binary Inspection', text: 'Select a JPEG/PNG photo or load the sample image.' },
      { name: 'Inspect Forensic EXIF & GPS Table', text: 'Review detected APP1 offsets, GPS coordinates, and device signatures.' },
      { name: 'Download Scrubbed Photo', text: 'Save the clean copy with 100% of tracking metadata removed.' },
    ],
    lsiKeywords: ['APP1 binary segment', 'EXIF GPS latitude longitude', 'strip camera serial number', 'IPTC XMP header removal', 'clean pixel re-encoding'],
    clusteredQueries: ['remove exif data from photo online free', 'check gps location in jpg image', 'strip camera metadata before uploading', 'bulk exif remover browser'],
    specTable: {
      supportedFormats: 'JPEG, PNG, WebP',
      maxFileCapacity: 'Depends on image dimensions and available browser memory',
      executionEngine: 'DataView 0xFFE1 APP1 Parser + Clean Canvas Pixel Re-encoder',
      privacyModel: 'Zero Server Upload / Local Forensic Scan',
      batchSupport: 'Multi-Photo Scrubbing + ZIP Export',
    },
    faqs: [
      { q: 'Do smartphone photos really contain my exact home GPS coordinates?', a: 'Yes. By default, iOS and Android embed exact GPS latitude, longitude, altitude, and timestamp tags inside the JPEG APP1 header.' },
      { q: 'How does Utilix guarantee 100% of EXIF data is gone?', a: 'Utilix decodes only the visible RGB pixel matrix onto a fresh HTML5 Canvas and encodes a brand-new image stream, leaving all APP1, EXIF, IPTC, and XMP byte segments behind.' },
      { q: 'Are my private photos uploaded anywhere during inspection?', a: 'No. Binary header parsing happens inside a JavaScript DataView in your browser tab.' },
      { q: 'Does stripping EXIF reduce file size too?', a: 'Yes, removing embedded color profiles, previews, and XMP packets often saves 15KB to 80KB per photo.' },
      { q: 'Can I scrub a batch of photos at once?', a: 'Yes, drop multiple photos and export all scrubbed images in one ZIP.' },
    ],
  },
  {
    id: 'social-media-image-resizer',
    hubId: 'image-tools',
    slug: 'social-media-image-resizer',
    canonicalPath: '/image-tools/social-media-image-resizer/',
    name: 'Social & E-Com Bulk Resizer',
    shortDesc: 'Resize images to YouTube, Instagram, LinkedIn, Amazon, and Favicon presets in 1 click.',
    primaryKeyword: 'Social Media & E-Commerce Bulk Image Resizer',
    valuePropSubtitle: '1-click multi-canvas export of a single upload into YouTube Thumbnail, Instagram Square/Story, LinkedIn Banner, Amazon (1000×1000), and Favicon pack.',
    subCategory: 'Resize',
    nextStepToolId: 'bulk-webp-avif-converter',
    nextStepPrompt: 'Want next-gen WebP versions of your resized pack? Open Bulk WebP Converter →',
    entityLeadSentence:
      'Utilix Social & E-Com Bulk Resizer is a multi-canvas image studio that transforms a single uploaded image into 6 platform-ready aspect ratios (YouTube, Instagram Square/Story, LinkedIn, Amazon 1000x1000, and Favicon) downloadable in one ZIP.',
    aeoQuestionHeading: 'How to Resize One Image for YouTube, Instagram, LinkedIn, and Amazon at Once?',
    aeoSummaryParagraph:
      'Upload a single high-resolution photo into Utilix Social & E-Com Bulk Resizer to automatically generate smart center-cropped versions for YouTube (1280×720), Instagram Square (1080×1080), Story (1080×1920), LinkedIn Banner (1584×396), Amazon (1000×1000), and Favicon (180×180) in one ZIP archive.',
    howToSteps: [
      { name: 'Upload Master Graphic or Photo', text: 'Drop one high-resolution image or click Load Sample Data.' },
      { name: 'Preview All 6 Platform Sizes', text: 'Inspect generated dimensions for YouTube, Instagram, LinkedIn, Amazon, and Favicon.' },
      { name: 'Download Complete Preset Pack ZIP', text: 'Click Download All as ZIP to get all 6 resized assets immediately.' },
    ],
    lsiKeywords: ['1280x720 YouTube thumbnail', '1080x1080 Instagram square', '1000x1000 Amazon product image', 'multi-canvas focal crop', 'social media asset generator'],
    clusteredQueries: ['resize image for instagram and youtube at once', 'amazon 1000x1000 image resizer free', 'social media bulk image cropper', 'one click social image pack'],
    specTable: {
      supportedFormats: 'PNG, JPG, WebP',
      maxFileCapacity: 'Up to 10K × 10K source resolution',
      executionEngine: 'Multi-Canvas Smart Cover Scaling + JSZip',
      privacyModel: '100% Local Browser Rendering',
      batchSupport: '1 Upload → 6 Platform Presets in 1 ZIP',
    },
    faqs: [
      { q: 'What exact pixel dimensions are included in the 1-click pack?', a: 'YouTube Thumbnail (1280×720), Instagram Square (1080×1080), Instagram/TikTok Story (1080×1920), LinkedIn Banner (1584×396), Amazon Product (1000×1000), and Web Favicon/Apple Touch Icon (180×180).' },
      { q: 'Does it distort or stretch my image?', a: 'No. Utilix uses proportional cover-scaling centered on the focal point so aspect ratios never stretch.' },
      { q: 'Can I download just one specific size instead of the full ZIP?', a: 'Yes, every generated preset card has its own individual Download button alongside the master ZIP export.' },
      { q: 'Are Amazon 1000×1000 images zoom-compliant?', a: 'Yes, Amazon Seller Central requires at least 1000×1000 pixels to unlock hover-zoom on product listings.' },
      { q: 'Is this tool completely free?', a: 'Yes, 100% free with no watermarks.' },
    ],
  },
  {
    id: 'image-to-text-ocr',
    hubId: 'image-tools',
    slug: 'image-to-text-ocr',
    canonicalPath: '/image-tools/image-to-text-ocr/',
    name: 'Browser OCR (Image to Text)',
    shortDesc: 'Extract selectable text from images and pasted screenshots (Ctrl+V).',
    primaryKeyword: 'Image to Text OCR Converter Online (Browser-Based)',
    valuePropSubtitle: 'Extract text from uploaded photos or pasted clipboard screenshots (Ctrl+V) and export to .txt, .md, or .json.',
    subCategory: 'OCR',
    nextStepToolId: 'text-to-txt-markdown',
    nextStepPrompt: 'Want to clean & format your extracted OCR text? Send to Text to TXT & Clean Markdown →',
    entityLeadSentence:
      'Utilix Browser OCR is a client-side optical character recognition utility with direct clipboard paste (Ctrl+V) support that extracts structured text from images and exports to TXT, Markdown, or JSON.',
    aeoQuestionHeading: 'How to Copy Text from a Screenshot or Image Without Uploading It?',
    aeoSummaryParagraph:
      'Press Ctrl+V to paste any screenshot directly into Utilix Browser OCR (or drop an image file) to extract lines, invoice numbers, and paragraphs locally, then copy or export the recognized text as .txt, .md, or .json.',
    howToSteps: [
      { name: 'Paste Screenshot (Ctrl+V) or Drop Image', text: 'Paste directly from your clipboard or click Load Sample Data.' },
      { name: 'Inspect Extracted Text & Confidence', text: 'Review recognized lines and edit directly in the output workspace.' },
      { name: 'Export as TXT, Markdown, or JSON', text: 'Copy to clipboard in 1 click or download in your chosen format.' },
    ],
    lsiKeywords: ['Optical Character Recognition (OCR)', 'clipboard screenshot paste Ctrl+V', 'extract text from image offline', 'invoice image to json', 'browser OCR engine'],
    clusteredQueries: ['copy text from image online free', 'paste screenshot to extract text', 'image to markdown ocr in browser', 'offline ocr no upload'],
    specTable: {
      supportedFormats: 'Input: PNG, JPG, WebP, Clipboard • Output: TXT, MD, JSON',
      maxFileCapacity: 'Depends on image dimensions and available browser memory',
      executionEngine: 'Client-Side Canvas Contrast Normalizer + Lexical OCR Pipeline',
      privacyModel: 'Zero Server Upload for Local OCR',
      batchSupport: 'Instant Clipboard Paste + Multi-Format Export',
    },
    faqs: [
      { q: 'Can I paste a screenshot directly without saving it as a file first?', a: 'Yes! Simply take a screenshot on Windows (Win+Shift+S) or Mac (Cmd+Ctrl+Shift+4) and press Ctrl+V anywhere on the page.' },
      { q: 'What export formats are available?', a: 'You can export recognized text as plain .txt, structured Markdown (.md), or line-indexed .json.' },
      { q: 'Does it work on dark-mode screenshots?', a: 'Yes, the canvas preprocessor normalizes luminance contrast automatically.' },
      { q: 'Can I edit the extracted text before downloading?', a: 'Yes, the output panel is live-editable and pipes directly into our Text & Markdown tools.' },
      { q: 'Is there any daily scan limit?', a: 'No, scan as many images and screenshots as you need.' },
    ],
  },

  // ==========================================================================
  // HUB 3: DEVELOPER TOOLS (6 Tools)
  // ==========================================================================
  {
    id: 'json-formatter-validator',
    hubId: 'dev-tools',
    slug: 'json-formatter-validator',
    canonicalPath: '/dev-tools/json-formatter-validator/',
    name: 'JSON Formatter & Auto-Fixer',
    shortDesc: 'Format, validate, auto-fix broken JSON, and convert to CSV, YAML, TS & SQL.',
    primaryKeyword: 'JSON Formatter, Validator & Auto-Fixer Online',
    valuePropSubtitle: 'AST parser with exact line/column error pinning, 1-click Auto-Fix Broken JSON, and instant conversion to CSV, YAML, TypeScript, and SQL.',
    subCategory: 'Format',
    popular: true,
    nextStepToolId: 'llm-token-counter',
    nextStepPrompt: 'Passing this JSON into an AI prompt? Calculate exact token cost in LLM Token Counter →',
    entityLeadSentence:
      'Utilix JSON Formatter is a free, client-side web application that validates, beautifies, repairs broken syntax, and converts JSON into CSV, YAML, TypeScript interfaces, and SQL statements directly in the browser with zero server data transmission.',
    aeoQuestionHeading: 'How to Automatically Fix Broken JSON and Convert It to CSV or TypeScript?',
    aeoSummaryParagraph:
      'Paste your raw or malformed JSON into Utilix JSON Formatter, click Auto-Fix Broken JSON to strip trailing commas and repair single quotes via jsonrepair, and switch tabs to export formatted JSON, CSV, YAML, TypeScript Interfaces, or SQL.',
    howToSteps: [
      { name: 'Paste JSON or Load Sample Payload', text: 'Paste API payloads or broken JSON into the editor or click Load Sample Data.' },
      { name: 'Validate or Click Auto-Fix Broken JSON', text: 'Inspect exact line/column syntax errors or repair malformed syntax in 1 click.' },
      { name: 'Convert to CSV, YAML, TS, or SQL', text: 'Switch output mode tabs to copy or download your transformed data.' },
    ],
    lsiKeywords: ['RFC 8259 specification', 'trailing comma repair', 'key-value serialization', 'UTF-8 character escaping', 'schema validation', 'indentation levels'],
    clusteredQueries: ['beautify json online', 'fix invalid json syntax error', 'convert nested json to csv online', 'json tree viewer and minifier'],
    specTable: {
      supportedFormats: 'Input: JSON / JSON5 / Malformed JSON • Output: JSON, CSV, YAML, TS, SQL',
      maxFileCapacity: '50MB+ JSON payloads in browser RAM',
      executionEngine: 'V8 JSON AST Parser + jsonrepair Engine',
      privacyModel: '100% Client-Side (API Keys & Payloads Never Leave Browser)',
      batchSupport: 'Multi-Format Export + Instant Minify/Prettify',
    },
    faqs: [
      { q: 'What syntax errors can "Auto-Fix Broken JSON" repair automatically?', a: 'Powered by jsonrepair, it automatically fixes trailing commas, single-quoted strings, unquoted object keys, missing closing brackets, and Python True/False/None constants.' },
      { q: 'Is it safe to paste production JSON containing API keys or PII?', a: 'The JSON formatting and conversion steps run in your browser; the JSON input is not sent to a processing API by this tool.' },
      { q: 'Can I convert an array of JSON objects directly into a CSV spreadsheet or SQL table?', a: 'Yes! Click the CSV or SQL tab in the output toolbar to generate RFC-compliant CSV rows or CREATE TABLE + INSERT statements.' },
      { q: 'Does it generate TypeScript interfaces from nested JSON?', a: 'Yes, select the TypeScript tab to infer strongly typed interfaces from any JSON payload.' },
      { q: 'What indentation levels are supported?', a: 'You can toggle between 2 spaces, 4 spaces, and compact 1-line minified JSON.' },
    ],
  },
  {
    id: 'llm-token-counter',
    hubId: 'dev-tools',
    slug: 'llm-token-counter',
    canonicalPath: '/dev-tools/llm-token-counter/',
    name: 'LLM Token Counter & Context Packer',
    shortDesc: 'Count tokens and API cost across Gemini, GPT-4o & Claude + pack multi-file prompts.',
    primaryKeyword: 'LLM Token Counter & API Cost Calculator Online',
    valuePropSubtitle: 'Real-time BPE token count, API pricing comparison across Gemini, GPT, and Claude, plus Repomix-style XML/Markdown context packing.',
    subCategory: 'AI Tokens',
    nextStepToolId: 'text-to-txt-markdown',
    nextStepPrompt: 'Want to strip zero-width watermarks from AI output? Open Text to TXT & Clean Markdown →',
    entityLeadSentence:
      'Utilix LLM Token Counter & Packer is a client-side BPE tokenization calculator and multi-file prompt formatter that estimates token usage and API costs across Google Gemini, OpenAI GPT-4o, and Anthropic Claude models.',
    aeoQuestionHeading: 'How to Calculate LLM Prompt Tokens and API Costs for Gemini, GPT, and Claude?',
    aeoSummaryParagraph:
      'Paste your prompt or drop multiple source code files into Utilix LLM Token Counter to view real-time sub-word token counts, context window saturation bars, and exact per-request USD pricing across Gemini, GPT-4o, and Claude Sonnet.',
    howToSteps: [
      { name: 'Paste Prompt or Drop Code Files', text: 'Enter text or drop multiple code files to pack into a unified repository prompt.' },
      { name: 'Compare Multi-Model Token Counts & Costs', text: 'Inspect live token estimates and input/output USD cost across Gemini, GPT, and Claude.' },
      { name: 'Copy Packed XML or Markdown Context', text: 'Export your formatted <repository_context> XML or Markdown prompt block in 1 click.' },
    ],
    lsiKeywords: ['Byte-Pair Encoding (BPE)', 'context window limit', 'input vs output token pricing', 'system prompt overhead', 'XML context tags', 'tiktoken'],
    clusteredQueries: ['gemini prompt token calculator', 'count tokens for gpt and claude', 'pack github code files for ai prompt', 'estimate llm api cost'],
    specTable: {
      supportedFormats: 'Plain Text, Markdown, Source Code (.ts, .py, .js, .json, .md)',
      maxFileCapacity: '2M+ Token Context Windows Supported',
      executionEngine: 'Client-Side BPE Sub-Word Tokenizer + Repomix XML/MD Packer',
      privacyModel: '100% Local Tokenization (Proprietary Code Never Uploaded)',
      batchSupport: 'Multi-File Code Context Packing + Comment Stripping',
    },
    faqs: [
      { q: 'Why do Gemini, GPT-4o, and Claude report slightly different token counts for the same text?', a: 'Each model family uses a different vocabulary size (e.g., SentencePiece 256k vs OpenAI o200k_base vs cl100k_base), causing code symbols and whitespace to split differently.' },
      { q: 'What is the XML Context Packer feature?', a: 'Inspired by Repomix, it wraps multiple files in clean <repository_context> and <file path="..."> XML tags with an ASCII directory tree, which LLMs parse with higher accuracy.' },
      { q: 'Can I strip code comments to save tokens before sending to an LLM?', a: 'Yes, toggle "Strip Comments & Empty Lines" to reduce prompt token count by 15%–30%.' },
      { q: 'Is my proprietary source code sent to an AI server when counting tokens?', a: 'No. Token counting and XML packing run 100% locally in your browser.' },
      { q: 'Does this page also include optional live Gemini Search Grounding & High-Thinking testing?', a: 'Yes, you can optionally invoke our server-side Gemini Search Grounding or High-Thinking reasoning sandbox right from the AI panel.' },
    ],
  },
  {
    id: 'regex-tester',
    hubId: 'dev-tools',
    slug: 'regex-tester',
    canonicalPath: '/dev-tools/regex-tester/',
    name: 'Live Regex Tester & AST Library',
    shortDesc: 'Test regular expressions in real time with capture groups and plain-English AST breakdown.',
    primaryKeyword: 'Live Regex Tester, Debugger & AST Explainer Online',
    valuePropSubtitle: 'Real-time RegExp execution with capture-group highlighting, plain-English token explanation, 1-click presets, and JS/Python/Go code gen.',
    subCategory: 'Regex',
    nextStepToolId: 'code-diff-checker',
    nextStepPrompt: 'Comparing regex refactored output? Verify changes in Code & Text Diff Checker →',
    entityLeadSentence:
      'Utilix Live Regex Tester is an interactive regular expression debugger that highlights capture groups in real time, translates every regex token into plain English, and generates ready-to-paste JavaScript, Python, and Go snippets.',
    aeoQuestionHeading: 'How to Test Regular Expressions and Understand Regex Tokens in Plain English?',
    aeoSummaryParagraph:
      'Enter your regular expression pattern and test string in Utilix Live Regex Tester (or select a 1-click preset like Email, IPv4, or URL) to immediately view matched capture groups, character indices, and a token-by-token plain-English AST explanation.',
    howToSteps: [
      { name: 'Enter Pattern or Pick a Preset', text: 'Type a regex pattern with flags (g, i, m) or choose Email, IPv4, URL, or Password presets.' },
      { name: 'Inspect Real-Time Capture Groups', text: 'View every match index and numbered capture group against your test string.' },
      { name: 'Copy Plain-English AST or Code Snippet', text: 'Review the token breakdown or copy generated JS, Python, or Go regex code.' },
    ],
    lsiKeywords: ['Regular Expression AST', 'capture group highlighting', 'non-capturing group', 'quantifier greediness', 'ECMAScript RegExp engine', 'regex code generator'],
    clusteredQueries: ['regex tester online with explanation', 'explain regex pattern in plain english', 'email and ipv4 regex preset library', 'convert regex to python and go'],
    specTable: {
      supportedFormats: 'ECMAScript / PCRE-compatible Regular Expressions',
      maxFileCapacity: 'Up to 500 matches displayed in real time with loop guard',
      executionEngine: 'Native RegExp Engine + Lexical Token AST Parser',
      privacyModel: '100% Client-Side Execution',
      batchSupport: 'Multi-Line Test Corpus + JS/Python/Go Export',
    },
    faqs: [
      { q: 'How does the plain-English Regex Explainer work?', a: 'Utilix parses your regular expression into individual lexical tokens (anchors, character classes, quantifiers, groups) and describes the exact matching rule for each token.' },
      { q: 'What happens if I accidentally write a catastrophic backtracking regex?', a: 'Utilix includes a safety iteration guard so zero-length or runaway matches never freeze your browser tab.' },
      { q: 'What presets are included in the 1-click library?', a: 'Email Address, IPv4 Address, Strong Password, HTTPS URL, Credit Card Number, and ISO-8601 Date.' },
      { q: 'Can I export ready-to-use code for Python or Go?', a: 'Yes, switch between JavaScript, Python (re.findall), and Go (regexp.MustCompile) snippets in the output panel.' },
      { q: 'Are flags like global (g), case-insensitive (i), and multiline (m) supported?', a: 'Yes, you can toggle flags interactively and see results update on every keystroke.' },
    ],
  },
  {
    id: 'jwt-decoder',
    hubId: 'dev-tools',
    slug: 'jwt-decoder',
    canonicalPath: '/dev-tools/jwt-decoder/',
    name: 'JWT Decoder & Inspector',
    shortDesc: 'Decode JSON Web Tokens (Header & Payload) with live expiration countdown.',
    primaryKeyword: 'JWT Decoder & Token Expiration Inspector Online',
    valuePropSubtitle: 'Base64Url decoding with human-readable translation of exp, iat, and nbf timestamps and a live expiration status badge.',
    subCategory: 'Security',
    nextStepToolId: 'password-api-key-generator',
    nextStepPrompt: 'Need a high-entropy 256-bit signing secret? Open Crypto Password & Key Gen →',
    entityLeadSentence:
      'Utilix JWT Decoder & Inspector is a zero-upload JSON Web Token analyzer that decodes Base64Url headers and payloads, translates Unix claim timestamps (exp, iat, nbf), and verifies token expiration status strictly inside browser RAM.',
    aeoQuestionHeading: 'How to Safely Decode a Production JWT Token Without Leaking Credentials?',
    aeoSummaryParagraph:
      'Paste your Bearer or raw JSON Web Token into Utilix JWT Decoder to inspect the decoded JOSE Header, JSON Payload claims, and live expiration countdown locally in your browser without transmitting sensitive auth tokens over the internet.',
    howToSteps: [
      { name: 'Paste JWT String', text: 'Paste a 3-part JWT (Header.Payload.Signature) or click Load Sample Data.' },
      { name: 'Inspect Decoded Header & Payload', text: 'View formatted JSON claims and human-readable exp, iat, and nbf ISO dates.' },
      { name: 'Verify Expiration Status', text: 'Check the live validity badge and copy decoded JSON claims in 1 click.' },
    ],
    lsiKeywords: ['RFC 7519 JSON Web Token', 'Base64Url decoding', 'JOSE header', 'HMAC SHA-256 signature', 'JWT exp claim countdown', 'zero-knowledge token debugger'],
    clusteredQueries: ['decode jwt token online safe', 'check if jwt is expired', 'jwt header and payload viewer client side', 'bearer token inspector'],
    specTable: {
      supportedFormats: 'RFC 7519 JWT (HS256, HS384, HS512, RS256, ES256)',
      maxFileCapacity: 'Instantaneous decoding',
      executionEngine: 'UTF-8 Base64Url Decoder + Temporal Claim Analyzer',
      privacyModel: '100% Local RAM (Auth Tokens Never Leave Browser)',
      batchSupport: 'Accepts Raw JWT or "Bearer <token>" Header Strings',
    },
    faqs: [
      { q: 'Why is pasting production JWTs into traditional online decoders dangerous?', a: 'Many legacy sites log requests or run server-side analytics, which can expose active session tokens. Utilix runs 100% client-side with zero network calls.' },
      { q: 'Does it automatically strip the "Bearer " prefix?', a: 'Yes, you can paste an entire Authorization header value and Utilix automatically strips "Bearer " before decoding.' },
      { q: 'How are exp, iat, and nbf numbers translated?', a: 'Utilix converts 10-digit Unix epoch seconds into full ISO-8601 timestamps and calculates exact hours/minutes remaining or elapsed.' },
      { q: 'Does decoding a JWT require the private signing key?', a: 'No. In RFC 7519, the Header and Payload are Base64Url-encoded JSON, so anyone can read them without the secret key (the secret key is only used to verify the signature).' },
      { q: 'Can I copy just the decoded payload JSON?', a: 'Yes, use the 1-click Copy Output button to copy the formatted JSON inspection report.' },
    ],
  },
  {
    id: 'code-diff-checker',
    hubId: 'dev-tools',
    slug: 'code-diff-checker',
    canonicalPath: '/dev-tools/code-diff-checker/',
    name: 'Code & Text Diff Checker',
    shortDesc: 'Compare two code or text blocks using Myers diff algorithm with .patch export.',
    primaryKeyword: 'Code & Text Diff Checker Online (Split & Unified View)',
    valuePropSubtitle: 'Myers diff algorithm computing line-level deltas locally with Ignore Whitespace/Case switches and instant Git .patch export.',
    subCategory: 'Diff',
    nextStepToolId: 'json-formatter-validator',
    nextStepPrompt: 'Comparing JSON configs? Normalize key order first in JSON Formatter →',
    entityLeadSentence:
      'Utilix Code & Text Diff Checker is a client-side comparison utility powered by the Myers diff algorithm that computes line-level additions and deletions with Ignore Whitespace/Case toggles and instant Git .patch export.',
    aeoQuestionHeading: 'How to Compare Two Code Files Offline and Export a Git Patch File?',
    aeoSummaryParagraph:
      'Paste your Original and Modified text or code blocks into Utilix Code & Text Diff Checker, toggle Ignore Whitespace or Ignore Case as needed, inspect highlighted additions and removals, and click Download .patch to export a unified Git diff.',
    howToSteps: [
      { name: 'Enter Original & Modified Text', text: 'Paste two versions of code/prose or click Load Sample Data.' },
      { name: 'Configure Diff Switches', text: 'Toggle Ignore Whitespace, Ignore Case, or switch between Unified and Patch views.' },
      { name: 'Export Unified Diff or .patch', text: 'Copy the delta report or download a standard Git .patch file.' },
    ],
    lsiKeywords: ['Myers diff algorithm', 'unified diff patch', 'line-level delta comparison', 'ignore whitespace diff', 'local code comparison'],
    clusteredQueries: ['compare two text files online', 'code diff checker client side', 'generate git patch online', 'diff tool ignore case and whitespace'],
    specTable: {
      supportedFormats: 'Source Code, JSON, YAML, Markdown, Plain Text',
      maxFileCapacity: '50,000+ lines compared in milliseconds',
      executionEngine: 'jsdiff Myers O(ND) Difference Algorithm',
      privacyModel: '100% Local Browser RAM (Proprietary Code Safe)',
      batchSupport: 'Instant Unified Diff + .patch File Download',
    },
    faqs: [
      { q: 'What algorithm powers the Utilix Diff Checker?', a: 'It uses Eugene Myers’s O(ND) difference algorithm via jsdiff, the same foundational algorithm used by Git.' },
      { q: 'Can I ignore indentation or trailing space changes?', a: 'Yes, enable the "Ignore Whitespace" toggle in the settings panel to focus strictly on semantic code changes.' },
      { q: 'How do I apply the exported .patch file in Git?', a: 'Download the .patch file and run `git apply document.patch` or `patch -p1 < document.patch` in your terminal.' },
      { q: 'Is my source code sent to a server?', a: 'Never. All comparisons happen inside your browser memory.' },
      { q: 'Does it show exact counts of added and removed lines?', a: 'Yes, the summary bar displays exact +Added and -Removed line counts in tabular numerals.' },
    ],
  },
  {
    id: 'base64-url-encoder',
    hubId: 'dev-tools',
    slug: 'base64-url-encoder',
    name: 'Base64, URL & Entity Codec',
    canonicalPath: '/dev-tools/base64-url-encoder/',
    shortDesc: 'UTF-8 safe Base64, URL percent-encoding, and HTML entity encoder/decoder.',
    primaryKeyword: 'Base64, URL & HTML Entity Encoder / Decoder Online',
    valuePropSubtitle: 'UTF-8 safe TextEncoder / Uint8Array binary-to-text pipeline with Data URI generation for CSS/HTML embedding.',
    subCategory: 'Format',
    nextStepToolId: 'jwt-decoder',
    nextStepPrompt: 'Working with Base64Url auth tokens? Inspect claims in JWT Decoder →',
    entityLeadSentence:
      'Utilix Base64, URL & Entity Codec is a UTF-8 safe binary-to-text encoding pipeline that encodes and decodes Base64, URL percent-encoded strings, and HTML entities locally in the browser using TextEncoder and Uint8Array.',
    aeoQuestionHeading: 'How to Encode and Decode UTF-8 Base64 Without Corrupting Unicode Characters?',
    aeoSummaryParagraph:
      'Unlike legacy btoa() converters that crash on Unicode emojis or accented letters, Utilix Base64 Codec serializes strings into UTF-8 byte arrays via TextEncoder before encoding or decoding Base64, URL parameters, and HTML entities.',
    howToSteps: [
      { name: 'Enter Text or Encoded String', text: 'Paste plain text, Base64, URL query strings, or HTML entities.' },
      { name: 'Select Codec Mode', text: 'Choose Base64 Encode/Decode, URL Encode/Decode, or HTML Entity Encode/Decode.' },
      { name: 'Copy or Download Output', text: 'Copy the transformed string immediately with 1 click.' },
    ],
    lsiKeywords: ['RFC 4648 Base64', 'UTF-8 TextEncoder Uint8Array', 'Data URI scheme', 'percent-encoding RFC 3986', 'HTML character entities'],
    clusteredQueries: ['base64 encode decode utf8 online', 'url encoder decoder free', 'html entity encoder online', 'convert image or text to data uri'],
    specTable: {
      supportedFormats: 'Base64, Base64 Data URI, URL RFC 3986, HTML5 Entities',
      maxFileCapacity: 'Multi-megabyte strings supported',
      executionEngine: 'Web API TextEncoder / TextDecoder + Uint8Array',
      privacyModel: '100% Local Browser Execution',
      batchSupport: 'Instant Reactive Codec Switching',
    },
    faqs: [
      { q: 'Why does standard JavaScript btoa() fail on emojis or non-ASCII text?', a: 'Native btoa() only accepts Latin1 (ISO-8859-1) characters. Utilix converts strings to UTF-8 bytes via TextEncoder first so all Unicode text encodes cleanly.' },
      { q: 'Does the Base64 decoder strip "data:image/png;base64," prefixes automatically?', a: 'Yes, if you paste a full Data URI, Utilix automatically strips the MIME header before decoding.' },
      { q: 'What is the difference between URL encodeURI and encodeURIComponent?', a: 'Utilix uses RFC 3986 encodeURIComponent rules so reserved characters like &, =, ?, and / are safely escaped for query parameters.' },
      { q: 'Which characters are escaped in HTML Entity mode?', a: 'It escapes &, <, >, ", and \' to prevent XSS injection when embedding code snippets in HTML.' },
      { q: 'Is any encoded string logged or transmitted?', a: 'The encoding and decoding steps run locally in your browser; the input string is not sent to a processing API by this tool.' },
    ],
  },

  // ==========================================================================
  // HUB 4: TEXT TOOLS (4 Tools)
  // ==========================================================================
  {
    id: 'word-counter-density',
    hubId: 'text-tools',
    slug: 'word-counter-density',
    canonicalPath: '/text-tools/word-counter-density/',
    name: 'Word Counter & SEO Density',
    shortDesc: 'Count words, characters, paragraphs, SERP pixel width, and N-gram keyword density.',
    primaryKeyword: 'Word Counter, Character Count & SEO Keyword Density Tool',
    valuePropSubtitle: 'Lexical tokenizer calculating 1-word, 2-word, and 3-word N-gram phrases, Google SERP pixel width meters, and reading/speaking time.',
    subCategory: 'Analyze',
    popular: true,
    nextStepToolId: 'case-converter-slug-generator',
    nextStepPrompt: 'Ready to publish your article? Generate SEO URL slugs in Case Converter & Slug Maker →',
    entityLeadSentence:
      'Utilix Word Counter & SEO Density is a real-time lexical analysis utility that calculates word/character counts, 1/2/3-word N-gram keyword density, reading time, and Google SERP pixel width locally in the browser.',
    aeoQuestionHeading: 'How to Check Keyword Density (1, 2, 3-Word Phrases) and Google Title Pixel Width?',
    aeoSummaryParagraph:
      'Paste your article or meta copy into Utilix Word Counter & SEO Density to view instant word, character, sentence, and paragraph metrics alongside stop-word filtered 1-word, 2-word, and 3-word phrase frequency tables and a live 600px SERP Title pixel gauge.',
    howToSteps: [
      { name: 'Paste Article or Meta Copy', text: 'Type or paste your draft into the workspace or click Load Sample Data.' },
      { name: 'Review Counts & SERP Pixel Meter', text: 'Check word/character counts, reading time, and Google Title pixel width.' },
      { name: 'Inspect 1/2/3-Word N-Gram Density', text: 'Analyze top unigrams, bigrams, and trigrams to prevent keyword stuffing.' },
    ],
    lsiKeywords: ['N-gram lexical tokenizer', 'Google SERP pixel width 600px', 'keyword density percentage', 'stop-word filtering', 'reading and speaking time calculator'],
    clusteredQueries: ['word counter with keyword density', 'google title pixel width checker', 'count words characters and paragraphs online', '2 word and 3 word phrase frequency'],
    specTable: {
      supportedFormats: 'Plain Text, Markdown, Draft Articles',
      maxFileCapacity: '100,000+ words analyzed in < 15ms',
      executionEngine: 'Lexical N-Gram Tokenizer + Arial 20px SERP Pixel Estimator',
      privacyModel: '100% Client-Side (Unpublished Drafts Stay Private)',
      batchSupport: 'Export Full SEO Audit Report as JSON/TXT',
    },
    faqs: [
      { q: 'Why does Google truncate titles by pixel width instead of character count?', a: 'Google Desktop SERPs allocate roughly 600 pixels in 20px Arial. Wide letters like "W" and "M" consume 13px while narrow letters like "i" and "l" use only 5px.' },
      { q: 'How are stop words handled in the Keyword Density table?', a: 'Common filler words ("the", "and", "of", "in") are automatically filtered out so you see true topical entities and N-grams.' },
      { q: 'How are Reading Time and Speaking Time calculated?', a: 'Reading time uses the adult silent reading benchmark of 225 words per minute; speaking time uses the presentation pace of 140 words per minute.' },
      { q: 'What is an ideal primary keyword density for SEO?', a: 'Most search engineers target 1.0% to 2.5% for primary unigrams and natural variation across 2-word and 3-word phrases.' },
      { q: 'Are my unpublished blog drafts stored on a server?', a: 'Never. Analysis runs 100% locally in your browser.' },
    ],
  },
  {
    id: 'text-to-txt-markdown',
    hubId: 'text-tools',
    slug: 'text-to-txt-markdown',
    canonicalPath: '/text-tools/text-to-txt-markdown/',
    name: 'Text to TXT & AI Watermark Cleaner',
    shortDesc: 'Strip hidden ChatGPT/LLM zero-width watermarks and export clean .txt or .md files.',
    primaryKeyword: 'Text to TXT File Converter & AI Watermark Cleaner',
    valuePropSubtitle: 'Strips hidden ChatGPT/Word formatting, removes zero-width watermarks, and exports clean .txt or .md files with custom LF/CRLF line endings.',
    subCategory: 'Clean',
    nextStepToolId: 'word-counter-density',
    nextStepPrompt: 'Want to check SEO keyword density on your cleaned text? Open Word Counter →',
    entityLeadSentence:
      'Utilix Text to TXT & Clean Markdown is a browser-side DOM and regex sanitizer that removes hidden zero-width Unicode watermarks (\\u200B, \\uFEFF) and non-breaking spaces before exporting UTF-8 .txt or .md files.',
    aeoQuestionHeading: 'How to Remove Hidden Zero-Width AI Watermarks and Download a Clean .TXT File?',
    aeoSummaryParagraph:
      'Paste text copied from ChatGPT, Claude, or Word into Utilix Text to TXT & AI Watermark Cleaner to automatically detect and strip invisible zero-width spaces (U+200B, U+FEFF), normalize smart quotes, and download a clean UTF-8 .txt or .md file.',
    howToSteps: [
      { name: 'Paste AI or Rich Text', text: 'Paste text from ChatGPT, Claude, Notion, or Word, or click Load Sample Data.' },
      { name: 'Review Scrubbed Watermark Count', text: 'Check the forensic counter showing removed zero-width and non-breaking characters.' },
      { name: 'Download as .TXT or .MD', text: 'Choose LF (macOS/Linux) or CRLF (Windows) line endings and download immediately.' },
    ],
    lsiKeywords: ['Plain text encoding', 'UTF-8 without BOM', 'zero-width space removal', 'CRLF vs LF line endings', 'Markdown syntax', 'Blob file download'],
    clusteredQueries: ['create txt file online and download', 'strip formatting from copied chatgpt text', 'remove hidden ai watermarks from text', 'convert string to md'],
    specTable: {
      supportedFormats: 'Input: Rich Text / AI Text / Markdown • Output: .txt, .md',
      maxFileCapacity: 'Depends on input length and available browser memory',
      executionEngine: 'Unicode Regex Scrubber + Turndown + Blob Constructor',
      privacyModel: '100% Local Browser Sanitization',
      batchSupport: 'Custom Filename & LF/CRLF Line Ending Export',
    },
    faqs: [
      { q: 'What invisible characters do LLMs and rich-text editors insert?', a: 'Copied text frequently contains Zero-Width Space (U+200B), Zero-Width Non-Joiner (U+200C), Byte Order Mark (U+FEFF), and Non-Breaking Spaces (U+00A0) that break code parsers and trigger watermark detectors.' },
      { q: 'Can I strip Markdown symbols (**bold**, # headings) into pure plain text?', a: 'Yes, toggle "Strip Markdown Formatting" in the settings panel to convert Markdown into clean plain prose.' },
      { q: 'What is the difference between LF and CRLF line endings?', a: 'LF (\\n) is standard on macOS, Linux, and modern Git repos, while CRLF (\\r\\n) is used by legacy Windows Notepad.' },
      { q: 'Does the downloaded .txt file use UTF-8 without BOM?', a: 'Yes, files are generated via the HTML5 Blob constructor using clean UTF-8 encoding.' },
      { q: 'Can I customize the exported file name and extension?', a: 'Yes, choose between .txt and .md export in a single click.' },
    ],
  },
  {
    id: 'case-converter-slug-generator',
    hubId: 'text-tools',
    slug: 'case-converter-slug-generator',
    canonicalPath: '/text-tools/case-converter-slug-generator/',
    name: 'Case Converter & SEO Slug Maker',
    shortDesc: 'Convert between 12 text cases (camelCase, snake_case, Title Case) and generate bulk SEO slugs.',
    primaryKeyword: 'Case Converter & Bulk SEO URL Slug Generator',
    valuePropSubtitle: 'Simultaneously transform text across 12 developer & editorial cases plus bulk stop-word filtered SEO URL slugs.',
    subCategory: 'Convert',
    nextStepToolId: 'duplicate-line-remover',
    nextStepPrompt: 'Managing a large list of URL slugs? Deduplicate and sort in Duplicate Line Cleaner →',
    entityLeadSentence:
      'Utilix Case Converter & Slug Maker is a Unicode-aware string transformer that converts text into 12 naming conventions (UPPER, lower, Title Case, camelCase, snake_case, kebab-case) and generates stop-word filtered SEO URL slugs in bulk.',
    aeoQuestionHeading: 'How to Convert Article Titles into Clean SEO URL Slugs and Developer Variable Cases?',
    aeoSummaryParagraph:
      'Type or paste one or multiple article titles into Utilix Case Converter & Slug Maker to simultaneously generate 12 case variations—including camelCase, PascalCase, snake_case, CONSTANT_CASE, and stop-word stripped SEO URL slugs.',
    howToSteps: [
      { name: 'Enter Titles or Identifiers', text: 'Paste one or multiple lines of text or click Load Sample Data.' },
      { name: 'Toggle Stop-Word Stripping', text: 'Enable stop-word removal to produce concise, high-ranking SEO URL slugs.' },
      { name: 'Click Any Case Card to Copy', text: 'Copy individual case outputs or export the full bulk slug list.' },
    ],
    lsiKeywords: ['Unicode NFD transliteration', 'camelCase to snake_case', 'SEO URL slug stop words', 'Title Case capitalization', 'kebab-case generator'],
    clusteredQueries: ['convert text to camelcase and snakecase', 'bulk url slug generator from titles', 'title case converter online', 'remove accents and diacritics for url'],
    specTable: {
      supportedFormats: 'Unicode Text, Multi-Line Article Titles, Variable Names',
      maxFileCapacity: '10,000+ lines in bulk slug mode',
      executionEngine: 'Unicode NFD Diacritic Normalizer + Regex Case Matrix',
      privacyModel: '100% Client-Side Execution',
      batchSupport: '12 Simultaneous Cases + Multi-Line Bulk Slug Export',
    },
    faqs: [
      { q: 'Why strip stop words ("a", "the", "in", "for") from SEO URL slugs?', a: 'Shorter, keyword-dense URLs (like `/compress-pdf-under-200kb/` instead of `/how-to-compress-a-pdf-for-the-web/`) earn higher click-through rates and align with Google’s URL hygiene guidelines.' },
      { q: 'How does it handle accented characters like "Café" or "Über"?', a: 'It applies Unicode NFD normalization to transliterate accented letters into clean ASCII equivalents ("cafe", "uber").' },
      { q: 'Can I convert camelCase code variables into snake_case or CONSTANT_CASE?', a: 'Yes, the splitter detects camelCase boundaries automatically before converting to all 12 formats.' },
      { q: 'Can I generate slugs for 50 blog post titles at once?', a: 'Yes, paste one title per line and copy the "Bulk Slugs (Per Line)" output.' },
      { q: 'Does it work offline?', a: 'Yes, 100% inside your browser.' },
    ],
  },
  {
    id: 'duplicate-line-remover',
    hubId: 'text-tools',
    slug: 'duplicate-line-remover',
    canonicalPath: '/text-tools/duplicate-line-remover/',
    name: 'Duplicate Line & List Cleaner',
    shortDesc: 'Remove duplicate lines, trim whitespace, add prefixes/suffixes, and sort lists in milliseconds.',
    primaryKeyword: 'Remove Duplicate Lines & Clean Text Lists Online',
    valuePropSubtitle: 'O(N) Set-based deduplication capable of processing 100,000+ lines with case-sensitivity, sorting, and prefix/suffix injection.',
    subCategory: 'Clean',
    nextStepToolId: 'json-formatter-validator',
    nextStepPrompt: 'Formatting data records next? Open JSON Formatter & Converter →',
    entityLeadSentence:
      'Utilix Duplicate Line & List Cleaner is a high-speed O(N) Set deduplication utility that strips duplicate rows, trims whitespace, injects custom prefixes/suffixes, and sorts lists alphanumerically inside browser RAM.',
    aeoQuestionHeading: 'How to Remove Duplicate Lines from a Massive List and Sort Alphanumerically?',
    aeoSummaryParagraph:
      'Paste your list into Utilix Duplicate Line & List Cleaner to deduplicate up to 100,000+ lines in milliseconds using an ES6 Set hash table, with instant toggles for case sensitivity, empty line removal, natural sorting, and line prefix/suffix wrapping.',
    howToSteps: [
      { name: 'Paste Multi-Line List', text: 'Paste emails, URLs, keywords, or log lines into the editor.' },
      { name: 'Set Deduplication & Sort Rules', text: 'Choose case sensitivity, A–Z / Z–A / Length sorting, and optional prefix/suffix strings.' },
      { name: 'Copy or Download Cleaned List', text: 'Inspect exact removed duplicate counts and export your unique list.' },
    ],
    lsiKeywords: ['O(N) Set deduplication', 'natural alphanumeric sort', 'trim leading trailing whitespace', 'wrap lines with quotes', 'bulk list sanitizer'],
    clusteredQueries: ['remove duplicate lines online free', 'deduplicate keyword list and sort', 'add prefix and suffix to each line', 'remove empty lines from text'],
    specTable: {
      supportedFormats: 'Multi-line Text, CSV columns, URL lists, Log files',
      maxFileCapacity: '100,000+ lines in < 25ms',
      executionEngine: 'ES6 Set Hash Deduplication + Intl.Collator Natural Sort',
      privacyModel: '100% Local Browser RAM (Email/Customer Lists Stay Private)',
      batchSupport: 'Prefix/Suffix Wrapping + Instant TXT Export',
    },
    faqs: [
      { q: 'How fast can it deduplicate 100,000 lines?', a: 'Because Utilix uses an O(N) JavaScript Set hash lookup rather than nested loops, 100,000 lines process in under 25 milliseconds.' },
      { q: 'How can I wrap every line in single quotes and a comma for a SQL IN() clause?', a: 'Type `\'` in the Prefix box and `\',` in the Suffix box to wrap every unique line automatically.' },
      { q: 'What is Natural Alphanumeric Sorting?', a: 'Natural sorting places "item2" before "item10" (numeric value order) rather than strict ASCII order.' },
      { q: 'Does Case-Insensitive mode preserve the original casing of the first occurrence?', a: 'Yes, it tracks lowercase keys in the Set while preserving the original display casing of the first kept line.' },
      { q: 'Are my email or keyword lists uploaded anywhere?', a: 'No, all list cleaning runs strictly inside your browser.' },
    ],
  },

  // ==========================================================================
  // HUB 5: GENERATORS & CALCULATORS (4 Tools)
  // ==========================================================================
  {
    id: 'custom-qr-code-generator',
    hubId: 'generators',
    slug: 'custom-qr-code-generator',
    canonicalPath: '/generators/custom-qr-code-generator/',
    name: 'Custom SVG/PNG QR Code Studio',
    shortDesc: 'Create permanent, non-expiring vector SVG & high-res PNG QR codes for URL, Wi-Fi, and vCard.',
    primaryKeyword: 'Free Vector SVG & PNG QR Code Generator (No Expiration)',
    valuePropSubtitle: '100% permanent static QR codes with Reed-Solomon error correction (L, M, Q, H), custom colors, Wi-Fi/vCard tabs, and print-ready .svg export.',
    subCategory: 'QR Code',
    popular: true,
    nextStepToolId: 'social-media-image-resizer',
    nextStepPrompt: 'Embedding QR graphics into social banners? Open Social & E-Com Bulk Resizer →',
    entityLeadSentence:
      'Utilix Custom SVG/PNG QR Studio is a client-side ISO/IEC 18004 barcode generator that produces permanent, non-expiring vector SVG and high-resolution PNG QR codes with Reed-Solomon error correction levels L, M, Q, and H.',
    aeoQuestionHeading: 'How to Generate a Free Vector SVG QR Code That Never Expires?',
    aeoSummaryParagraph:
      'Enter your URL, Wi-Fi network credentials, or vCard contact details in Utilix Custom SVG/PNG QR Studio, select Reed-Solomon Error Correction Level H and custom brand colors, and download a permanent static vector .svg or 600px .png QR code.',
    howToSteps: [
      { name: 'Select Payload Mode (URL, Wi-Fi, vCard)', text: 'Enter a website link, Wi-Fi SSID/password, or contact text.' },
      { name: 'Customize Colors & Error Correction', text: 'Pick foreground/background hex colors and Reed-Solomon level (L, M, Q, H).' },
      { name: 'Download Vector .SVG or High-Res .PNG', text: 'Export print-ready vector SVG paths or raster PNG in 1 click.' },
    ],
    lsiKeywords: ['ISO/IEC 18004 standard', 'Reed-Solomon error correction level H', 'quiet zone margin', 'vector SVG path', 'vCard payload', 'static vs dynamic QR'],
    clusteredQueries: ['qr code generator with logo no expiration', 'create wifi qr code vector svg', 'static qr code maker free forever', 'high resolution qr png'],
    specTable: {
      supportedFormats: 'Output: Vector SVG (.svg) & High-Res PNG (.png)',
      maxFileCapacity: 'Up to 2,953 bytes per QR symbol',
      executionEngine: 'ISO/IEC 18004 Matrix + Reed-Solomon ECC Generator',
      privacyModel: '100% Static Direct Encoding (Zero Redirect Tracking)',
      batchSupport: 'URL, Wi-Fi Login, vCard & Plain Text Modes',
    },
    faqs: [
      { q: 'Why do QR codes from other "free" websites stop working after 14 days?', a: 'Many competitors secretly encode a redirect URL pointing to their own servers and hold it hostage behind a paid subscription. Utilix encodes your data directly into the QR matrix so it works forever.' },
      { q: 'Which error correction level should I choose for print or logo overlays?', a: 'Choose Level H (High, 30% recovery), which allows up to 30% of the QR code to be covered or smudged while remaining scannable.' },
      { q: 'How does the Wi-Fi QR Code mode work?', a: 'It formats your network SSID, encryption type (WPA/WPA2), and password into the standard `WIFI:T:WPA;S:...;P:...;;` schema recognized natively by iOS and Android cameras.' },
      { q: 'Why download SVG instead of PNG for printing?', a: 'Vector SVG paths scale infinitely in Adobe Illustrator, Figma, or print flyers without pixelation.' },
      { q: 'Are my Wi-Fi passwords sent to a server when generating a QR code?', a: 'Never. The QR matrix is computed locally in your browser.' },
    ],
  },
  {
    id: 'password-api-key-generator',
    hubId: 'generators',
    slug: 'password-api-key-generator',
    canonicalPath: '/generators/password-api-key-generator/',
    name: 'Crypto Password & API Key Gen',
    shortDesc: 'Generate CSPRNG passwords, BIP39 passphrases, UUID v4, and 256-bit JWT secrets with entropy math.',
    primaryKeyword: 'Cryptographic Password, Passphrase & 256-Bit API Key Generator',
    valuePropSubtitle: 'Hardware-backed window.crypto.getRandomValues() CSPRNG with real-time bits-of-entropy and offline GPU crack-time calculation.',
    subCategory: 'Security',
    nextStepToolId: 'jwt-decoder',
    nextStepPrompt: 'Using your 256-bit secret to sign tokens? Inspect tokens in JWT Decoder →',
    entityLeadSentence:
      'Utilix Crypto Password & Key Gen is a hardware-backed CSPRNG security utility that generates high-entropy passwords, memorable passphrases, UUID v4 identifiers, and 256-bit hex JWT secrets using window.crypto.getRandomValues().',
    aeoQuestionHeading: 'How to Generate Cryptographically Secure Passwords and 256-Bit JWT Secrets in Browser?',
    aeoSummaryParagraph:
      'Use Utilix Crypto Password & Key Gen to sample entropy directly from your operating system CSPRNG (`window.crypto.getRandomValues()`), generating passwords, 5-word passphrases, UUID v4s, and 64-character hex API keys with live bits-of-entropy math.',
    howToSteps: [
      { name: 'Configure Length & Character Sets', text: 'Slide password length (8–64 chars) and toggle uppercase, lowercase, digits, and symbols.' },
      { name: 'Verify Bits of Entropy & Crack Time', text: 'Check the live Shannon entropy calculation (e.g., 128+ bits) and GPU resistance rating.' },
      { name: 'Copy Password, Passphrase, UUID, or 256-Bit Key', text: 'Copy any generated credential in 1 click.' },
    ],
    lsiKeywords: ['window.crypto.getRandomValues CSPRNG', 'Shannon bits of entropy', '256-bit HMAC secret', 'BIP39 memorable passphrase', 'UUID v4 RFC 4122'],
    clusteredQueries: ['secure password generator client side', 'generate 256 bit jwt secret hex', 'passphrase generator with entropy calculator', 'uuid v4 generator online'],
    specTable: {
      supportedFormats: 'Passwords, 5-Word Passphrases, UUID v4, 256-bit Hex Secrets',
      maxFileCapacity: 'Instantaneous hardware CSPRNG sampling',
      executionEngine: 'Web Crypto API (crypto.getRandomValues & randomUUID)',
      privacyModel: 'Zero-Knowledge / Generated Strictly in Local RAM',
      batchSupport: 'Simultaneous Multi-Format Credential Generation',
    },
    faqs: [
      { q: 'Why is Math.random() unsafe for password generation?', a: 'Math.random() uses a predictable pseudo-random PRNG (xorshift128+). Utilix strictly uses `window.crypto.getRandomValues()`, which draws entropy from your OS kernel CSPRNG.' },
      { q: 'How many bits of entropy do I need for production security?', a: '80+ bits resists offline GPU clusters for centuries, while 128+ bits is the cryptographic standard for API keys and JWT signing secrets.' },
      { q: 'Does the generator avoid ambiguous characters like 0/O and 1/l/I?', a: 'Yes, our default character alphabet excludes visually ambiguous glyphs so passwords remain easy to read when needed.' },
      { q: 'Can I use the 64-character hex string for HMAC-SHA256 JWT signing?', a: 'Yes, 64 hexadecimal characters equal 32 bytes (256 bits) of cryptographic entropy.' },
      { q: 'Are generated passwords ever transmitted over the network?', a: 'Never. Generation occurs 100% locally in your browser.' },
    ],
  },
  {
    id: 'unix-timestamp-converter',
    hubId: 'generators',
    slug: 'unix-timestamp-converter',
    canonicalPath: '/generators/unix-timestamp-converter/',
    name: 'Epoch & Timezone Converter',
    shortDesc: 'Convert 10-digit (s), 13-digit (ms), and 19-digit (ns) Unix timestamps across global timezones.',
    primaryKeyword: 'Unix Epoch Timestamp & Multi-Timezone Converter Online',
    valuePropSubtitle: 'Auto-detects seconds, milliseconds, and nanoseconds, displaying ISO-8601, UTC, relative time, and a 6-city developer timezone grid.',
    subCategory: 'Time',
    nextStepToolId: 'cron-expression-generator',
    nextStepPrompt: 'Scheduling recurring background jobs? Build expressions in Cron Expression Studio →',
    entityLeadSentence:
      'Utilix Epoch & Timezone Converter is a developer temporal utility that auto-detects 10-digit (seconds), 13-digit (milliseconds), and 19-digit (nanoseconds) Unix timestamps and renders ISO-8601, UTC, and multi-city timezone conversions.',
    aeoQuestionHeading: 'How to Convert 10-Digit and 13-Digit Unix Timestamps to ISO-8601 and Local Time?',
    aeoSummaryParagraph:
      'Paste any Unix epoch integer or ISO-8601 date string into Utilix Epoch & Timezone Converter to automatically detect precision (seconds vs milliseconds vs nanoseconds) and view synchronized timestamps across UTC, San Francisco, New York, London, Berlin, and Tokyo.',
    howToSteps: [
      { name: 'Paste Unix Epoch or ISO Date', text: 'Enter a 10/13/19-digit timestamp or ISO date, or click Use Current Time.' },
      { name: 'Check Auto-Detected Precision & ISO-8601', text: 'Review whether the input is seconds, milliseconds, or nanoseconds.' },
      { name: 'Compare Across Global Developer Timezones', text: 'Inspect the 6-city timezone grid and copy any formatted timestamp.' },
    ],
    lsiKeywords: ['Unix Epoch 1970-01-01T00:00:00Z', 'Intl.DateTimeFormat IANA timezone', '10-digit vs 13-digit epoch', 'ISO-8601 date string', 'Year 2038 64-bit safe'],
    clusteredQueries: ['epoch to human date converter', 'unix milliseconds to utc and local time', 'iso 8601 to unix timestamp', 'developer timezone comparison table'],
    specTable: {
      supportedFormats: 'Unix Seconds (10d), Milliseconds (13d), Nanoseconds (19d), ISO-8601',
      maxFileCapacity: 'Instantaneous temporal parsing',
      executionEngine: 'ECMAScript Date + Intl.DateTimeFormat IANA Timezone Engine',
      privacyModel: '100% Client-Side Execution',
      batchSupport: '6-City Global Timezone Matrix',
    },
    faqs: [
      { q: 'How does Utilix distinguish between seconds, milliseconds, and nanoseconds?', a: '10-digit integers represent seconds since Jan 1, 1970 UTC; 13-digit integers represent JavaScript/Java milliseconds; and 16–19 digit integers represent Go/Linux nanoseconds.' },
      { q: 'Can I convert a human-readable ISO-8601 date back into Unix seconds?', a: 'Yes! Paste any ISO string like `2026-11-13T10:30:00Z` and both Epoch Seconds and Epoch Milliseconds are calculated immediately.' },
      { q: 'Does the multi-city grid handle Daylight Saving Time (DST) automatically?', a: 'Yes, `Intl.DateTimeFormat` uses the browser’s IANA timezone database (`America/New_York`, `Europe/London`, etc.) to apply exact historical and current DST offsets.' },
      { q: 'Is it safe from the 32-bit Year 2038 overflow bug?', a: 'Yes, JavaScript uses 64-bit IEEE-754 safe integers supporting dates up to ±270,000 years.' },
      { q: 'Can I copy the ISO-8601 output in 1 click?', a: 'Yes, click Copy Output or press Ctrl+Shift+C.' },
    ],
  },
  {
    id: 'cron-expression-generator',
    hubId: 'generators',
    slug: 'cron-expression-generator',
    canonicalPath: '/generators/cron-expression-generator/',
    name: 'Cron Expression Studio',
    shortDesc: 'Translate 5-field cron schedules into plain English and preview the next 10 execution dates.',
    primaryKeyword: 'Cron Expression Generator, Parser & Schedule Evaluator',
    valuePropSubtitle: 'Interactive cron schedule builder with instant plain-English AST translation and exact calculation of the next 10 execution timestamps.',
    subCategory: 'Cron',
    nextStepToolId: 'unix-timestamp-converter',
    nextStepPrompt: 'Need epoch timestamps for your scheduled runs? Open Epoch & Timezone Converter →',
    entityLeadSentence:
      'Utilix Cron Expression Studio is a client-side crontab AST parser and schedule simulator that translates 5-field cron expressions into plain English and computes the exact next 10 UTC execution timestamps.',
    aeoQuestionHeading: 'How to Test a Cron Expression and Preview the Exact Next 10 Execution Times?',
    aeoSummaryParagraph:
      'Enter a 5-field cron string (such as `*/15 * * * *` or `0 9 * * 1-5`) into Utilix Cron Expression Studio or pick a quick preset to read a plain-English translation and verify the exact next 10 scheduled execution dates and times.',
    howToSteps: [
      { name: 'Enter 5-Field Cron Expression or Pick Preset', text: 'Type `[min] [hour] [day] [month] [weekday]` or select a preset schedule.' },
      { name: 'Read Plain-English Translation', text: 'Verify the human-readable schedule summary and field-by-field breakdown.' },
      { name: 'Inspect Next 10 Execution Timestamps', text: 'Review the simulated upcoming 10 trigger dates in UTC.' },
    ],
    lsiKeywords: ['POSIX crontab syntax', '5-field cron AST parser', 'GitHub Actions schedule cron', 'Kubernetes CronJob expression', 'step values and ranges'],
    clusteredQueries: ['cron expression to english translator', 'test cron schedule next run times', 'crontab guru alternative no ads', 'cron every 15 minutes syntax'],
    specTable: {
      supportedFormats: 'Standard 5-Field POSIX Crontab (`* * * * *`)',
      maxFileCapacity: 'Simulates 10 future runs in < 5ms',
      executionEngine: 'Client-Side Cron AST Parser & Temporal Iterator',
      privacyModel: '100% Local Browser Execution',
      batchSupport: '1-Click Presets + Copyable Schedule Report',
    },
    faqs: [
      { q: 'What are the 5 fields in a standard cron expression?', a: 'From left to right: Minute (0–59), Hour (0–23), Day of Month (1–31), Month (1–12), and Day of Week (0–6, where 0 is Sunday).' },
      { q: 'What does `*/15 * * * *` mean?', a: 'The `*/15` step operator in the minute field means "run every 15th minute (0, 15, 30, 45) of every hour, every day."' },
      { q: 'Are these expressions compatible with GitHub Actions and Kubernetes CronJobs?', a: 'Yes, both GitHub Actions `on.schedule` and Kubernetes CronJobs use standard 5-field POSIX cron syntax evaluated in UTC.' },
      { q: 'Can I combine comma lists and hyphenated ranges like `0 9 * * 1-5`?', a: 'Yes, `1-5` in the Day of Week field runs Monday through Friday at 09:00.' },
      { q: 'Does it calculate leap years and month lengths accurately?', a: 'Yes, the simulator steps through real ECMAScript Date calendar boundaries.' },
    ],
  },
];

export function getToolById(id: string): ToolDefinition | undefined {
  return TOOLS_CATALOG.find((t) => t.id === id);
}

export function getToolsByHub(hubId: HubId): ToolDefinition[] {
  return TOOLS_CATALOG.filter((t) => t.hubId === hubId);
}

export function getHubById(hubId: HubId): HubDefinition | undefined {
  return HUBS.find((h) => h.id === hubId);
}
