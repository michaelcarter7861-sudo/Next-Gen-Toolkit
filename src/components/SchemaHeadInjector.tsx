import { useEffect } from 'react';
import { ToolDefinition, HubDefinition, getHubById, TOOLS_CATALOG, HUBS } from '../data/toolsCatalog';
import { HOME_FAQS, HUB_FAQS, TOOL_EDITORIAL_LINKS } from '../data/seoSchemaData';

interface SchemaHeadInjectorProps {
  activeTool: ToolDefinition | null;
  activeHub: HubDefinition | null;
  isSitemapView?: boolean;
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
  const canonicalUrl = `${baseUrl}${tool.canonicalPath}`;
  const editorial = TOOL_EDITORIAL_LINKS[tool.id];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: 'NextGenToolkit',
        url: `${baseUrl}/`,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/favicon.svg`,
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        name: 'NextGenToolkit',
        url: `${baseUrl}/`,
        publisher: { '@id': `${baseUrl}/#organization` },
      },
      {
        '@type': 'WebPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: `${tool.name} | NextGenToolkit`,
        description: tool.aeoSummaryParagraph,
        isPartOf: { '@id': `${baseUrl}/#website` },
        breadcrumb: { '@id': `${canonicalUrl}#breadcrumb` },
        ...(editorial
          ? {
              relatedLink: editorial.internalLinks.map(
                (il) => `${baseUrl}${il.href.startsWith('/') ? il.href : `/${il.href}`}`
              ),
            }
          : {}),
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${canonicalUrl}#software`,
        name: `NextGenToolkit ${tool.name}`,
        operatingSystem: 'Any (Web Browser)',
        applicationCategory: 'UtilitiesApplication',
        isAccessibleForFree: true,
        url: canonicalUrl,
        description: tool.entityLeadSentence,
        featureList: [
          tool.valuePropSubtitle,
          `Engine: ${tool.specTable.executionEngine}`,
          `Supported Formats: ${tool.specTable.supportedFormats}`,
          `Privacy Model: ${tool.specTable.privacyModel}`,
          'Data handling depends on the utility: local-only operations retain inputs in the browser; remote-service features may transmit required data to providers.',
        ],
        ...(editorial
          ? {
              isBasedOn: editorial.externalLinks.map((ext) => ({
                '@type': 'CreativeWork',
                name: ext.keywordAnchor,
                url: ext.url,
                publisher: { '@type': 'Organization', name: ext.sourceName },
              })),
            }
          : {}),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@type': 'HowTo',
        '@id': `${canonicalUrl}#howto`,
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
        '@id': `${canonicalUrl}#faq`,
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
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
          { '@type': 'ListItem', position: 2, name: hub?.name || 'Tools', item: `${baseUrl}${hub?.slug || '/'}` },
          { '@type': 'ListItem', position: 3, name: tool.name, item: canonicalUrl },
        ],
      },
    ],
  };
}

const formatBrandedSeoTitle = (subject: string): string => {
  const suffix = ' | NextGenToolkit';
  const clean = subject.replace(/\s+/g, ' ').trim();
  if (clean.length + suffix.length <= 60) {
    return `${clean}${suffix}`;
  }
  const maxSubject = 60 - suffix.length;
  const trimmed = clean.slice(0, maxSubject).replace(/\s+\S*$/, '');
  return `${trimmed}${suffix}`;
};

const formatSeoDescription = (rawDesc: string): string => {
  const clean = rawDesc.replace(/\s+/g, ' ').trim();
  if (clean.length <= 158) return clean;
  return `${clean.slice(0, 155).replace(/\s+\S*$/, '')}…`;
};

export function SchemaHeadInjector({
  activeTool,
  activeHub,
  isSitemapView = false,
}: SchemaHeadInjectorProps) {
  useEffect(() => {
    const baseUrl = getSiteUrl();
    const ogImageUrl = `${baseUrl}/og-cover.png`;
    let title = 'NextGenToolkit | 25+ Free PDF, Image & Developer Tools';
    let description =
      'Compress PDFs & images to exact KB, format broken JSON, count LLM tokens, and run 25+ free browser-based tools with NextGenToolkit.';
    let canonical = `${baseUrl}/`;
    let schema: Record<string, unknown>;

    if (isSitemapView) {
      title = formatBrandedSeoTitle('Complete SEO Sitemap & All 25 Tools Directory');
      description = formatSeoDescription(
        'Browse all 32 canonical pages on NextGenToolkit across PDF Tools, Image Tools, Developer Tools, Text Tools, and Calculators & Generators.'
      );
      canonical = `${baseUrl}/sitemap/`;
      schema = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': `${baseUrl}/#organization`,
            name: 'NextGenToolkit',
            url: `${baseUrl}/`,
            logo: { '@type': 'ImageObject', url: `${baseUrl}/favicon.svg` },
          },
          {
            '@type': 'CollectionPage',
            '@id': `${canonical}#webpage`,
            name: 'NextGenToolkit Complete SEO Sitemap & Directory',
            description,
            url: canonical,
            isPartOf: { '@type': 'WebSite', '@id': `${baseUrl}/#website`, name: 'NextGenToolkit', url: `${baseUrl}/` },
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: TOOLS_CATALOG.length,
              itemListElement: TOOLS_CATALOG.map((t, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: t.name,
                url: `${baseUrl}${t.canonicalPath}`,
              })),
            },
          },
          {
            '@type': 'BreadcrumbList',
            '@id': `${canonical}#breadcrumb`,
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
              { '@type': 'ListItem', position: 2, name: 'SEO Sitemap & Directory', item: canonical },
            ],
          },
        ],
      };
    } else if (activeTool) {
      title = formatBrandedSeoTitle(`${activeTool.name} - Free Online Tool`);
      description = formatSeoDescription(activeTool.aeoSummaryParagraph);
      canonical = `${baseUrl}${activeTool.canonicalPath}`;
      schema = buildToolJsonLd(activeTool);
    } else if (activeHub) {
      const hubTools = TOOLS_CATALOG.filter((t) => t.hubId === activeHub.id);
      const hubFaqs = HUB_FAQS[activeHub.id] || [];
      title = formatBrandedSeoTitle(`${activeHub.name} - Free Browser Utilities`);
      description = formatSeoDescription(activeHub.description);
      canonical = `${baseUrl}${activeHub.slug}`;
      schema = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': `${baseUrl}/#organization`,
            name: 'NextGenToolkit',
            url: `${baseUrl}/`,
            logo: { '@type': 'ImageObject', url: `${baseUrl}/favicon.svg` },
          },
          {
            '@type': 'CollectionPage',
            '@id': `${canonical}#webpage`,
            name: `${activeHub.name} | NextGenToolkit`,
            description,
            url: canonical,
            isPartOf: { '@type': 'WebSite', '@id': `${baseUrl}/#website`, name: 'NextGenToolkit', url: `${baseUrl}/` },
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
            '@type': 'FAQPage',
            '@id': `${canonical}#faq`,
            mainEntity: hubFaqs.map((f) => ({
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
            '@id': `${canonical}#breadcrumb`,
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
            '@type': 'Organization',
            '@id': `${baseUrl}/#organization`,
            name: 'NextGenToolkit',
            url: `${baseUrl}/`,
            logo: {
              '@type': 'ImageObject',
              url: `${baseUrl}/favicon.svg`,
            },
          },
          {
            '@type': 'WebSite',
            '@id': `${baseUrl}/#website`,
            name: 'NextGenToolkit',
            alternateName: ['nextgentoolkit', 'NextGen Toolkit'],
            url: `${baseUrl}/`,
            description,
            publisher: { '@id': `${baseUrl}/#organization` },
            potentialAction: {
              '@type': 'SearchAction',
              target: `${baseUrl}/?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          },
          {
            '@type': 'WebApplication',
            '@id': `${baseUrl}/#webapp`,
            name: 'NextGenToolkit',
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'All',
            isAccessibleForFree: true,
            url: `${baseUrl}/`,
            description,
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
          },
          {
            '@type': 'ItemList',
            '@id': `${baseUrl}/#directory`,
            name: 'NextGenToolkit 25 Browser Utilities Directory',
            numberOfItems: TOOLS_CATALOG.length,
            itemListElement: HUBS.map((h, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: h.name,
              url: `${baseUrl}${h.slug}`,
            })),
          },
          {
            '@type': 'FAQPage',
            '@id': `${baseUrl}/#faq`,
            mainEntity: HOME_FAQS.map((f) => ({
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
            '@id': `${baseUrl}/#breadcrumb`,
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
            ],
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
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', canonical);
    setMeta('meta[property="og:site_name"]', 'content', 'NextGenToolkit');
    setMeta('meta[property="og:image"]', 'content', ogImageUrl);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);
    setMeta('meta[name="twitter:image"]', 'content', ogImageUrl);

    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonical;

    let script = document.getElementById('nextgentoolkit-jsonld-schema') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'nextgentoolkit-jsonld-schema';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);
  }, [activeTool, activeHub, isSitemapView]);

  return null;
}
