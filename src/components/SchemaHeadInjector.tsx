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
        name: `UTILIX ${tool.name}`,
        operatingSystem: 'Web browser',
        applicationCategory: 'UtilitiesApplication',
        isAccessibleForFree: true,
        url: `${baseUrl}${tool.canonicalPath}`,
        description: tool.aeoSummaryParagraph,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
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
    let title = 'UTILIX — Free Online PDF, Image, Text & Developer Tools';
    let description = 'Use free online PDF, image, text and developer tools. Compress files, convert formats, clean text and generate QR codes.';
    let canonical = `${baseUrl}/`;
    let schema: Record<string, unknown>;

    if (activeTool) {
      title = `${activeTool.primaryKeyword} | UTILIX`;
      description = activeTool.aeoSummaryParagraph;
      canonical = `${baseUrl}${activeTool.canonicalPath}`;
      schema = buildToolJsonLd(activeTool);
    } else if (activeHub) {
      title = `${activeHub.name} — Free Online Tools | UTILIX`;
      description = activeHub.description;
      canonical = `${baseUrl}${activeHub.slug}`;
      schema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: activeHub.name,
        description,
        url: canonical,
        isPartOf: { '@type': 'WebSite', name: 'UTILIX', url: `${baseUrl}/` },
      };
    } else {
      schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'UTILIX',
        url: `${baseUrl}/`,
        description,
      };
    }

    document.title = title;
    const setMeta = (selector: string, attribute: string, value: string) => {
      const element = document.querySelector(selector);
      if (element) element.setAttribute(attribute, value);
    };
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', canonical);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);

    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonical;

    let script = document.getElementById('utilix-jsonld-schema') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'utilix-jsonld-schema';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);
  }, [activeTool, activeHub]);

  return null;
}
