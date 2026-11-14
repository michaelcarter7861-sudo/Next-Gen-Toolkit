import { useEffect } from 'react';
import { ToolDefinition, HubDefinition, getHubById, TOOLS_CATALOG, HUBS } from '../data/toolsCatalog';

interface SchemaHeadInjectorProps {
  activeTool: ToolDefinition | null;
  activeHub: HubDefinition | null;
}

export function getSiteUrl(): string {
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
        name: `NextGenToolkit ${tool.name}`,
        operatingSystem: 'Web browser (Chrome, Firefox, Safari, Edge, Mobile)',
        applicationCategory: 'UtilitiesApplication',
        isAccessibleForFree: true,
        url: `${baseUrl}${tool.canonicalPath}`,
        description: tool.entityLeadSentence,
        keywords: [tool.primaryKeyword, ...tool.lsiKeywords, ...tool.clusteredQueries].join(', '),
        featureList: [
          tool.valuePropSubtitle,
          `Engine: ${tool.specTable.executionEngine}`,
          `Supported Formats: ${tool.specTable.supportedFormats}`,
          `Privacy Model: ${tool.specTable.privacyModel}`,
        ],
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@type': 'HowTo',
        name: tool.aeoQuestionHeading,
        description: tool.aeoSummaryParagraph,
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
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
          { '@type': 'ListItem', position: 2, name: hub?.name || 'Tools', item: `${baseUrl}${hub?.slug || '/'}` },
          { '@type': 'ListItem', position: 3, name: tool.name, item: `${baseUrl}${tool.canonicalPath}` },
        ],
      },
    ],
  };
}

export function SchemaHeadInjector({ activeTool, activeHub }: SchemaHeadInjectorProps) {
  useEffect(() => {
    const baseUrl = getSiteUrl();
    let title = 'NextGenToolkit — 25+ Free Online PDF, Image, Text & Developer Tools';
    let description =
      'NextGenToolkit provides 25+ browser-based PDF, image, text, developer, and generator utilities. Compress files to exact KB, convert WebP, format JSON, and generate vector QR codes.';
    let keywords =
      'NextGenToolkit, nextgentoolkit, client-side web tools, compress PDF to 100KB, target KB image compressor, JSON formatter and validator, LLM token counter, EXIF metadata remover, vector QR code generator';
    let canonical = `${baseUrl}/`;
    let schema: Record<string, unknown>;

    if (activeTool) {
      title = `${activeTool.primaryKeyword} | NextGenToolkit`;
      description = activeTool.aeoSummaryParagraph;
      keywords = [
        activeTool.primaryKeyword,
        ...activeTool.lsiKeywords,
        ...activeTool.clusteredQueries,
        'NextGenToolkit',
      ].join(', ');
      canonical = `${baseUrl}${activeTool.canonicalPath}`;
      schema = buildToolJsonLd(activeTool);
    } else if (activeHub) {
      const hubTools = TOOLS_CATALOG.filter((t) => t.hubId === activeHub.id);
      title = `${activeHub.name} — Free Online Browser Utilities | NextGenToolkit`;
      description = activeHub.description;
      keywords = [activeHub.name, ...activeHub.hubLsiKeywords, 'NextGenToolkit'].join(', ');
      canonical = `${baseUrl}${activeHub.slug}`;
      schema = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'CollectionPage',
            name: `${activeHub.name} | NextGenToolkit`,
            description,
            url: canonical,
            keywords,
            isPartOf: { '@type': 'WebSite', name: 'NextGenToolkit', url: `${baseUrl}/` },
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: hubTools.map((t, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: t.name,
                url: `${baseUrl}${t.canonicalPath}`,
              })),
            },
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
              { '@type': 'ListItem', position: 2, name: activeHub.name, item: canonical },
            ],
          },
        ],
      };
    } else {
      schema = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            name: 'NextGenToolkit',
            alternateName: ['nextgentoolkit', 'NextGen Toolkit'],
            url: `${baseUrl}/`,
            description,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${baseUrl}/?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          },
          {
            '@type': 'ItemList',
            name: 'NextGenToolkit 25 Browser Utilities Directory',
            numberOfItems: TOOLS_CATALOG.length,
            itemListElement: HUBS.map((h, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: h.name,
              url: `${baseUrl}${h.slug}`,
            })),
          },
        ],
      };
    }

    document.title = title;
    const setMeta = (selector: string, attribute: string, value: string) => {
      let element = document.querySelector(selector);
      if (!element && selector.startsWith('meta[')) {
        element = document.createElement('meta');
        const match = selector.match(/meta\[(name|property)="([^"]+)"\]/);
        if (match) {
          element.setAttribute(match[1], match[2]);
          document.head.appendChild(element);
        }
      }
      if (element) element.setAttribute(attribute, value);
    };

    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[name="keywords"]', 'content', keywords);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', canonical);
    setMeta('meta[property="og:site_name"]', 'content', 'NextGenToolkit');
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);

    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonical;

    let script = document.getElementById('nextgentoolkit-jsonld-schema') as HTMLScriptElement | null;
    if (!script) {
      // Also check legacy id if present
      script = document.getElementById('utilix-jsonld-schema') as HTMLScriptElement | null;
    }
    if (!script) {
      script = document.createElement('script');
      script.id = 'nextgentoolkit-jsonld-schema';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);
  }, [activeTool, activeHub]);

  return null;
}
