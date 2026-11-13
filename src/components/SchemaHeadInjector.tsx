import { useEffect } from 'react';
import { ToolDefinition, HubDefinition, getHubById } from '../data/toolsCatalog';

interface SchemaHeadInjectorProps {
  activeTool: ToolDefinition | null;
  activeHub: HubDefinition | null;
}

function getSiteUrl(): string {
  const configured = import.meta.env.VITE_SITE_URL;
  if (configured) return configured.replace(/\/$/, '');
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${window.location.origin}${base}`;
}

export function buildToolJsonLd(tool: ToolDefinition): Record<string, unknown> {
  const hub = getHubById(tool.hubId);
  const baseUrl = getSiteUrl();

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: `Utilix ${tool.name}`,
        operatingSystem: 'All (Web Browser - Chrome, Firefox, Safari, Edge)',
        applicationCategory: 'UtilitiesApplication',
        isAccessibleForFree: true,
        url: `${baseUrl}${tool.canonicalPath}`,
        description: tool.entityLeadSentence,
        offers: {
          '@type': 'Offer',
          price: '0.00',
          priceCurrency: 'USD',
        },
        featureList: [
          '100% Client-Side WebAssembly & HTML5 Processing (Zero Server Upload)',
          tool.valuePropSubtitle,
          'Unlimited Batch Processing with 1-Click JSZip Export',
          'No Watermarks and No Account Registration Required',
        ],
      },
      {
        '@type': 'HowTo',
        name: tool.aeoQuestionHeading,
        description: tool.aeoSummaryParagraph,
        totalTime: 'PT10S',
        step: tool.howToSteps.map((s, idx) => ({
          '@type': 'HowToStep',
          position: idx + 1,
          name: s.name,
          text: s.text,
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: tool.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.a,
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${baseUrl}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: hub?.name || 'Tools',
            item: `${baseUrl}${hub?.slug || '/'}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: tool.name,
            item: `${baseUrl}${tool.canonicalPath}`,
          },
        ],
      },
    ],
  };
}

export function SchemaHeadInjector({ activeTool, activeHub }: SchemaHeadInjectorProps) {
  useEffect(() => {
    const baseUrl = getSiteUrl();
    let title = 'UTILIX — Free Online PDF, Image, Text & Developer Tools';
    let desc =
      'Use free online PDF, image, text and developer tools in your browser. Compress files, convert formats, generate QR codes and more.';
    let canonical = `${baseUrl}/`;

    if (activeTool) {
      title = `${activeTool.primaryKeyword} | Utilix`;
      desc = activeTool.entityLeadSentence;
      canonical = `${baseUrl}${activeTool.canonicalPath}`;
    } else if (activeHub) {
      title = `${activeHub.name} – 100% Client-Side Utilities | Utilix`;
      desc = activeHub.description;
      canonical = `${baseUrl}${activeHub.slug}`;
    }

    document.title = title;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', desc);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', desc);

    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.rel = 'canonical';
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.href = canonical;

    // Inject Multi-Graph JSON-LD Schema
    let scriptEl = document.getElementById('utilix-jsonld-schema') as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'utilix-jsonld-schema';
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    if (activeTool) {
      scriptEl.textContent = JSON.stringify(buildToolJsonLd(activeTool), null, 2);
    } else {
      scriptEl.textContent = JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Utilix',
          url: 'https://utilix.tools/',
          description: desc,
        },
        null,
        2
      );
    }
  }, [activeTool, activeHub]);

  return null;
}
