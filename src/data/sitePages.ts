/**
 * @license SPDX-License-Identifier: MIT
 *
 * Trust pages (About, Contact, Privacy, Terms, Editorial policy, Changelog).
 *
 * These pages exist because a utility site that asks people to put passport
 * photos, bank statements and API keys into a browser tab has to say who is
 * behind it, what happens to the data, and what the product does *not* do yet.
 *
 * Rules for editing this file:
 *  - Never invent team members, credentials, awards, addresses or testimonials.
 *  - Never promise a capability that the code does not implement.
 *  - Every factual claim about processing must match the actual code path.
 */

export interface SitePageSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface SitePageDefinition {
  slug: string;
  navLabel: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  updated: string;
  sections: SitePageSection[];
}

const UPDATED = '2026-11-16';
/** Public contact details are intentionally absent until the owner approves one.
 *  See audit/SECOND-PHASE-REMAINING-WORK-VERIFICATION.md — publishing an
 *  unapproved address is treated as a release blocker, not a placeholder. */
const REPO_URL = 'https://github.com/michaelcarter7861-sudo/Next-Gen-Toolkit';

export const SITE_PAGES: SitePageDefinition[] = [
  {
    slug: '/about/',
    navLabel: 'About',
    title: 'About NextGenToolkit — browser-first utilities, honestly described',
    description:
      'Who builds NextGenToolkit, how the tools are tested, which operations really run in your browser, and what is still in development.',
    h1: 'About NextGenToolkit',
    intro:
      'NextGenToolkit is an independent, browser-first utility project: a small set of PDF, image, text and developer tools that run inside your own browser instead of on a server that receives your files.',
    updated: UPDATED,
    sections: [
      {
        heading: 'Why this project exists',
        paragraphs: [
          'Most online file tools ask you to upload the thing you care about most — a passport photograph, a signed contract, a bank statement, a set of API keys — to a server you cannot inspect. The tools often work well, but the privacy model is invisible to the person using them.',
          'NextGenToolkit was built to test a narrower, more honest idea: for a useful subset of everyday tasks, the browser is already a capable enough computer. Canvas can re-encode images, pdf-lib can rebuild PDF object streams, Web Crypto can generate keys, and none of that requires your file to leave the tab.',
        ],
      },
      {
        heading: 'What actually runs in your browser',
        paragraphs: [
          'These operations are implemented client-side in this repository and do not send file content to a processing server: PDF merge, split, metadata stripping and structural optimisation; image compression to a target size, format conversion, EXIF scrubbing, social-size exports; JSON formatting and repair, JWT decoding, regex testing, diffing, Base64/URL encoding, token estimation, word and N-gram counting, case and slug conversion, duplicate-line removal, cron parsing, epoch conversion, password generation and QR generation.',
          'Two things are deliberately not claimed. First, no OCR engine is bundled yet, so image-to-text does not extract text. Second, PDF pages are not rasterised yet, so PDF-to-image does not produce real page images. Both pages say this in plain language and neither emits placeholder content that looks like a result.',
        ],
      },
      {
        heading: 'What is not local',
        paragraphs: [
          'The site embeds a Google Tag Manager container (GTM-5HBHCCBT). That container can load analytics or other tags depending on how the external account is configured, and those tags may transmit page and interaction events to third parties. This is separate from file processing: analytics events do not include your file contents, but the container is third-party code and you should treat it as such.',
          'There are no accounts, no logins and no server-side user database. Two small preferences — pinned tools and recently used tools — are stored in your browser\u2019s localStorage and never transmitted.',
        ],
      },
      {
        heading: 'How the tools are tested',
        paragraphs: [
          'The text and developer engines have an automated test suite that runs on every build (JSON repair and conversion, JWT parsing, regex evaluation, diffing, codecs, token estimation, cron parsing, page-range parsing and binary image-header inspection).',
          'Binary document tooling is harder to test automatically because it depends on the browser\u2019s canvas and file APIs. That produced a real failure: earlier builds shipped an image-to-text tool that echoed input and a PDF-to-image tool that drew placeholder shapes. Neither was a conversion. Both were removed in the November 2026 integrity pass and replaced with an honest availability notice. If a tool cannot do what its title says, it should not pretend to.',
        ],
      },
      {
        heading: 'How to judge us',
        paragraphs: [
          'Do not take the privacy claims on faith. Open your browser\u2019s DevTools, switch to the Network tab, clear it, and run a tool. You should see no request carrying your file. You will see the Google Tag Manager request, because that is real too.',
          'If something is wrong, incomplete or over-claimed, the fastest route is to tell us — the contact details are on the contact page.',
        ],
      },
    ],
  },
  {
    slug: '/contact/',
    navLabel: 'Contact',
    title: 'Contact NextGenToolkit — bug reports, tool requests, corrections',
    description:
      'How to reach the NextGenToolkit maintainer about bugs, incorrect claims, privacy questions or tool requests, and what to include in a report.',
    h1: 'Contact',
    intro:
      'One maintainer, no support queue, no chatbot. The public repository is currently the only contact channel; here is what gets a fast, useful reply.',
    updated: UPDATED,
    sections: [
      {
        heading: 'Contact channel',
        paragraphs: [
          'There is no published support address yet. A single, owner-approved contact channel has not been supplied, and inventing one would be worse than admitting the gap — so bug reports and corrections go through the public repository for now, where every message is visible and archived.',
          'Once the owner approves a public address it will be published here, on the About page and in the footer, and the change will be recorded in the changelog.',
        ],
      },
      {
        heading: 'Bug reports',
        paragraphs: [
          'The most valuable report is a reproducible one. Please include the tool URL, the browser and version, the input type and approximate size (for example "3.2 MB JPEG from an iPhone"), what you expected, and what happened. If a file is sensitive, do not send it — describe it instead, or reproduce the problem with a generated sample.',
          'Reports about a tool claiming something it does not do are treated as the highest priority, above new features.',
        ],
      },
      {
        heading: 'Corrections and privacy questions',
        paragraphs: [
          'If a page contains a factual error, an over-claim, or a privacy statement that does not match the code, say which page and which sentence. Corrections are logged in the changelog so the history stays visible.',
        ],
      },
      {
        heading: 'Source code',
        paragraphs: [
          `The project repository is at ${REPO_URL}. If your organisation needs to verify the processing claims before allowing the tools internally, reading the engines in src/utils/ is the intended path.`,
        ],
      },
      {
        heading: 'What is not offered',
        paragraphs: [
          'There is no phone support, no live chat and no guaranteed response time. There is also no paid tier, so nothing is prioritised by payment. Requests are prioritised by how many users are affected and how badly the current behaviour misleads them.',
        ],
      },
    ],
  },
  {
    slug: '/privacy/',
    navLabel: 'Privacy',
    title: 'Privacy policy — what stays in your browser and what does not',
    description:
      'Exactly which data NextGenToolkit processes locally in your browser, what Google Tag Manager can collect, what is stored on your device, and your choices.',
    h1: 'Privacy policy',
    intro:
      'This page separates two things that are often blurred together: what happens to the file you are working on, and what third-party page code can observe. Both are described below as they exist in the code today.',
    updated: UPDATED,
    sections: [
      {
        heading: 'File and text processing',
        paragraphs: [
          'For the client-side tools listed on the About page, the file or text is read into browser memory and processed there using JavaScript APIs (Canvas, Web Crypto, pdf-lib, JSZip). The content is not transmitted to a NextGenToolkit server; the project has no file-processing server.',
          'Two features are not available at all in the current static build: OCR (image to text) and PDF page rasterisation. Their pages say so and produce no output. The optional AI studio is also disabled here because it requires a server endpoint; the dialog states that when opened.',
        ],
      },
      {
        heading: 'Page analytics and third-party scripts',
        paragraphs: [
          'The site loads a Google Tag Manager container (GTM-5HBHCCBT) on every page. Depending on how that external container is configured, it may load Google Analytics or other tags, and those tags may receive page URLs, referrers, approximate location derived from IP, device information and interaction events such as button clicks.',
          'That data is processed by those third parties under their own policies, not by NextGenToolkit directly. The container configuration lives outside this repository, which means this project cannot promise exactly which tags are active at any moment. If you need certainty, block third-party scripts for this domain in your browser; the tools continue to work because they do not depend on the tag manager.',
        ],
      },
      {
        heading: 'Cookies and consent',
        paragraphs: [
          'NextGenToolkit itself does not set cookies. Third-party tags loaded through the container may set cookies or similar identifiers.',
          'A consent management platform is not currently implemented. That is a real gap for visitors in the EEA and UK, and it is tracked as a P0 item in the project roadmap rather than hidden in this text.',
        ],
      },
      {
        heading: 'What is stored on your device',
        bullets: [
          'ngt_favorites_v1 — the list of tools you have pinned.',
          'ngt_recent_v1 — up to six recently opened tool identifiers.',
          'Both live in localStorage, never leave your browser, and can be cleared by clearing site data.',
        ],
      },
      {
        heading: 'What is never requested',
        bullets: [
          'No account, email address or password is required to use any tool.',
          'No file content is sent to a NextGenToolkit server, because none exists for file processing.',
          'No payment details are collected; there is no paid tier.',
        ],
      },
      {
        heading: 'Your choices and rights',
        paragraphs: [
          'You can use the site with third-party scripts blocked, in a private window, or offline after the first load. If you believe personal data has been processed unlawfully, contact the address on the contact page and the request will be handled in good faith; for data held by Google or another tag vendor, their own privacy controls apply.',
        ],
      },
      {
        heading: 'Children',
        paragraphs: [
          'The tools are general-purpose utilities and are not directed at children under 13. No account data is collected, so no age verification is performed.',
        ],
      },
      {
        heading: 'Changes to this policy',
        paragraphs: [
          'Material changes are recorded in the changelog with a date. The "last updated" line on this page changes only when the substance changes, not on every deployment.',
        ],
      },
    ],
  },
  {
    slug: '/terms/',
    navLabel: 'Terms',
    title: 'Terms of use — free utilities, no warranty, acceptable use',
    description:
      'The terms that apply when you use NextGenToolkit: free access, no warranty, acceptable use, intellectual property and liability.',
    h1: 'Terms of use',
    intro:
      'Plain terms for a free tool site: use it freely, verify important output, do not misuse it, and understand that it comes without a warranty.',
    updated: UPDATED,
    sections: [
      {
        heading: 'The service',
        paragraphs: [
          'NextGenToolkit provides free, browser-based file and text utilities. There is no account, no subscription and no paid tier. The project may add, change or withdraw tools at any time.',
        ],
      },
      {
        heading: 'No warranty',
        paragraphs: [
          'The tools are provided "as is" and "as available", without warranties of any kind, express or implied, including fitness for a particular purpose. File processing involves lossy operations: compression changes image quality, PDF optimisation can alter document structure, and conversions may lose formatting.',
          'Always keep your original file. Do not rely on a compressed or converted output as your only copy of a document that matters, and verify that an output meets a portal\u2019s requirements before submitting it.',
        ],
      },
      {
        heading: 'Acceptable use',
        bullets: [
          'Do not use the tools for unlawful purposes, or on material you do not have the right to process.',
          'Do not attempt to disrupt, overload or reverse-engineer the hosting infrastructure.',
          'Do not present the tools as your own product, or remove attribution when embedding them.',
          'Do not use automated scraping against the site in a way that degrades service for other visitors.',
        ],
      },
      {
        heading: 'Your content',
        paragraphs: [
          'You retain all rights to the files and text you process. Because processing happens in your browser, the project does not receive a copy and claims no licence over your content.',
        ],
      },
      {
        heading: 'Intellectual property',
        paragraphs: [
          'The site design, copy and source code are the project\u2019s intellectual property unless stated otherwise. Third-party libraries remain under their own licences (pdf-lib, JSZip, qrcode, diff, turndown, jsonrepair, React and others).',
        ],
      },
      {
        heading: 'Third-party links and services',
        paragraphs: [
          'Pages cite external standards and documentation. Those sites are not controlled by this project. Pages also load a Google Tag Manager container, which is a third-party service subject to its own terms.',
        ],
      },
      {
        heading: 'Limitation of liability',
        paragraphs: [
          'To the maximum extent permitted by applicable law, the project operator is not liable for indirect, incidental or consequential loss arising from use of the tools, including lost data, rejected applications caused by an output file, or business interruption. Where liability cannot be excluded, it is limited to the amount you paid to use the service, which is zero.',
        ],
      },
      {
        heading: 'Governing terms',
        paragraphs: [
          'These terms are governed by the laws applicable at the project operator\u2019s principal place of business. If any provision is unenforceable, the remaining provisions continue to apply.',
        ],
      },
    ],
  },
  {
    slug: '/editorial-policy/',
    navLabel: 'Editorial policy',
    title: 'Editorial policy — how tool pages are written, tested and corrected',
    description:
      'How NextGenToolkit decides what a page claims, how features are tested before being described, how AI is used, and how corrections are handled.',
    h1: 'Editorial policy',
    intro:
      'Most tool pages on the internet describe features that were never tested. This page states the rules this project holds itself to, and what happens when it fails them.',
    updated: UPDATED,
    sections: [
      {
        heading: 'Claims follow code',
        paragraphs: [
          'A page may only describe behaviour that exists in the shipped build. If an engine is not implemented, the page says so. If a target cannot always be met, the copy says "usually" instead of "always". Marketing language does not override implementation.',
        ],
      },
      {
        heading: 'Feature status labels',
        bullets: [
          'Live — the advertised operation is implemented and tested.',
          'Preview — the interface exists but the core engine does not. Preview pages are excluded from the sitemap, marked noindex, and never emit simulated or placeholder output.',
        ],
      },
      {
        heading: 'Testing standard',
        paragraphs: [
          'Text and developer engines are covered by automated tests that run on every build. Binary engines are verified with fixture files where the environment allows, and are described more cautiously where it does not. When a limitation is known — for example that scanned PDFs cannot reach a strict size ceiling without image re-encoding — it is stated on the tool page rather than buried.',
        ],
      },
      {
        heading: 'Use of AI',
        paragraphs: [
          'AI assistance may be used for drafting and for code review. It is not used to generate fake benchmarks, fake reviews, fake author identities or filler pages designed only to rank. Numbers published on this site come from measurements that can be reproduced, and the method is described alongside them.',
        ],
      },
      {
        heading: 'Independence and monetisation',
        paragraphs: [
          'There are no sponsored tools, no paid placements and no affiliate links in tool recommendations. If that changes, the change will be disclosed on the affected page and in the changelog.',
        ],
      },
      {
        heading: 'Corrections',
        paragraphs: [
          'Factual errors are corrected when found, and the correction is recorded in the changelog. Silent edits that hide a previous over-claim are not acceptable. The November 2026 entries document the removal of two tools whose behaviour did not match their titles.',
        ],
      },
    ],
  },
  {
    slug: '/changelog/',
    navLabel: 'Changelog',
    title: 'Changelog — what changed in NextGenToolkit and why',
    description:
      'A dated record of meaningful changes to NextGenToolkit, including removals, corrections and newly shipped capabilities.',
    h1: 'Changelog',
    intro:
      'Only changes that affect what the product does, what it claims, or how it handles data. Cosmetic deploys are not listed.',
    updated: UPDATED,
    sections: [
      {
        heading: '2026-11-16 — Integrity pass',
        bullets: [
          'Removed fabricated output from PDF-to-image: the tool previously drew placeholder shapes and presented them as rendered pages. Page rasterisation is not shipped, so the page now says that and the tool is marked Preview (noindex, excluded from the sitemap).',
          'Removed fabricated output from image-to-text OCR: the tool previously echoed input or inserted canned sample text. No OCR engine is bundled, so the page now says that and the tool is marked Preview.',
          'Fixed PDF optimisation reporting. The previous build clamped reported savings to a minimum of 4%, so a file that grew by 23% was shown as "9% reduced", and a 2.8 MB scan was labelled as a 100 KB result. Optimisation now reports the measured byte change, returns the original unchanged when it cannot do better, and no longer scales page content (which distorted layout without reducing size).',
          'Fixed image compression output format. Selecting WebP or PNG previously produced a JPEG anyway. WebP, PNG and JPEG are now honoured, PNG is kept lossless with size controlled by scaling, and transparency is preserved where the format allows it.',
          'Added trust pages: About, Contact, Privacy, Terms, Editorial policy and this changelog.',
          'Corrected the homepage H1 so the primary topic is stated in text rather than only in a brand tagline.',
          'Corrected brand and metadata inconsistencies (stale placeholder brand name, a mismatched analytics container ID in the machine-readable summary, and a page-count error in the sitemap page).',
          'Repaired the CI pipeline: the dependency install failed from a clean checkout, and two workflow steps contained literal escape sequences that broke the shell and Node steps.',
          'Added security headers, immutable asset caching and noindexing for preview deployments.',
        ],
      },
      {
        heading: '2026-11-14 — Bot and sitemap work',
        bullets: [
          'Removed redundant sitemap aliases so one canonical sitemap is advertised.',
          'Added explicit allowances for AI search crawlers in robots.txt.',
        ],
      },
      {
        heading: 'Earlier',
        bullets: [
          'Initial release: 25 browser utilities across PDF, image, developer, text and generator categories, with prerendered pages, structured data and build-time SEO verification.',
        ],
      },
    ],
  },
];

export const SITE_PAGE_SLUGS = SITE_PAGES.map((page) => page.slug);

export function getSitePage(slug: string): SitePageDefinition | undefined {
  const normalised = slug.endsWith('/') ? slug : `${slug}/`;
  return SITE_PAGES.find((page) => page.slug === normalised);
}
