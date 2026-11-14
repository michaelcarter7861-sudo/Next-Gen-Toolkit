import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  X,
  ArrowRight,
  FileCode2,
  Globe,
  BrainCircuit,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Download,
  Star,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { TOOLS_CATALOG, HUBS, HubId } from '../data/toolsCatalog';

interface CommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (toolId: string) => void;
  onSelectHub: (hubId: HubId) => void;
  favoriteIds?: string[];
  onToggleFavorite?: (toolId: string) => void;
}

export function CommandModal({
  isOpen,
  onClose,
  onSelectTool,
  onSelectHub,
  favoriteIds = [],
  onToggleFavorite,
}: CommandModalProps) {
  const [query, setQuery] = useState('');
  const [selectedHubFilter, setSelectedHubFilter] = useState<HubId | 'all' | 'favorites'>('all');

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedHubFilter('all');
    }
  }, [isOpen]);

  const q = query.trim().toLowerCase();
  const filteredTools = useMemo(() => {
    return TOOLS_CATALOG.filter((t) => {
      if (selectedHubFilter === 'favorites' && !favoriteIds.includes(t.id)) return false;
      if (selectedHubFilter !== 'all' && selectedHubFilter !== 'favorites' && t.hubId !== selectedHubFilter) {
        return false;
      }
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.shortDesc.toLowerCase().includes(q) ||
        t.primaryKeyword.toLowerCase().includes(q) ||
        t.lsiKeywords.some((k) => k.toLowerCase().includes(q)) ||
        t.clusteredQueries.some((cq) => cq.toLowerCase().includes(q))
      );
    });
  }, [q, selectedHubFilter, favoriteIds]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/55 backdrop-blur-xs pt-16 sm:pt-20 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="NextGenToolkit Quick Tool Launcher"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E8E6F2] dark:border-[#2A2E42]">
          <Search className="w-5 h-5 text-[#7047EB] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 25 utilities by name, LSI keyword, or format (e.g. 20KB, PDF, JSON, JWT, QR)..."
            className="w-full bg-transparent text-sm text-[#171927] dark:text-[#F8F7FC] placeholder-[#64748B] focus:outline-none"
          />
          <button
            onClick={onClose}
            aria-label="Close launcher"
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#171927] dark:hover:text-white hover:bg-[#F8F7FC] dark:hover:bg-[#252A3F]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Instant Hub & Favorites Filter Bar */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#F8F7FC] dark:bg-[#151824] border-b border-[#E8E6F2] dark:border-[#2A2E42] overflow-x-auto">
          <button
            type="button"
            onClick={() => setSelectedHubFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedHubFilter === 'all'
                ? 'bg-[#7047EB] text-white'
                : 'text-[#64748B] hover:text-[#171927] dark:hover:text-white'
            }`}
          >
            All ({TOOLS_CATALOG.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedHubFilter('favorites')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedHubFilter === 'favorites'
                ? 'bg-[#7047EB] text-white'
                : 'text-[#64748B] hover:text-[#171927] dark:hover:text-white'
            }`}
          >
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>Pinned ({favoriteIds.length})</span>
          </button>
          {HUBS.map((hub) => (
            <button
              key={hub.id}
              type="button"
              onClick={() => setSelectedHubFilter(hub.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedHubFilter === hub.id
                  ? 'bg-[#7047EB] text-white'
                  : 'text-[#64748B] hover:text-[#171927] dark:hover:text-white'
              }`}
            >
              {hub.shortTitle}
            </button>
          ))}
        </div>

        <div className="max-h-[400px] overflow-y-auto p-3 space-y-4">
          {!q && selectedHubFilter === 'all' && (
            <div>
              <div className="px-3 py-1 text-xs font-semibold text-[#64748B]">
                Topical Category Hubs (5)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-1">
                {HUBS.map((hub) => (
                  <button
                    key={hub.id}
                    onClick={() => {
                      onSelectHub(hub.id);
                      onClose();
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left border border-[#E8E6F2] dark:border-[#2A2E42] hover:border-[#7047EB] transition-colors"
                  >
                    <span className="truncate">{hub.shortTitle}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#7047EB] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="px-3 py-1 text-xs font-semibold text-[#64748B]">
              Matching Utilities ({filteredTools.length})
            </div>
            <div className="space-y-1 mt-1">
              {filteredTools.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#64748B]">
                  {selectedHubFilter === 'favorites'
                    ? 'No pinned tools yet. Click the star icon next to any utility to pin it for instant access.'
                    : `No utilities matched "${query}". Try searching by format (PDF, WebP, JSON, CSV, SVG).`}
                </div>
              ) : (
                filteredTools.map((tool) => {
                  const hub = HUBS.find((h) => h.id === tool.hubId);
                  const isFav = favoriteIds.includes(tool.id);
                  return (
                    <div
                      key={tool.id}
                      className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F8F7FC] dark:hover:bg-[#252A3F] text-left transition-colors group"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onSelectTool(tool.id);
                          onClose();
                        }}
                        className="flex-1 min-w-0 text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#171927] dark:text-[#F8F7FC] group-hover:text-[#7047EB] transition-colors">
                            {tool.name}
                          </span>
                          <span className="text-xs text-[#64748B]">· {hub?.shortTitle}</span>
                        </div>
                        <p className="text-xs text-[#64748B] truncate">{tool.shortDesc}</p>
                      </button>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="hidden sm:inline text-xs font-mono text-[#64748B] group-hover:text-[#7047EB]">
                          {tool.canonicalPath}
                        </span>
                        {onToggleFavorite && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite(tool.id);
                            }}
                            aria-label={isFav ? `Unpin ${tool.name}` : `Pin ${tool.name}`}
                            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#1C1F2E] text-[#64748B] hover:text-amber-500 transition-colors"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                isFav ? 'fill-amber-400 text-amber-400' : ''
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-3 bg-[#F8F7FC] dark:bg-[#151824] border-t border-[#E8E6F2] dark:border-[#2A2E42] text-xs text-[#64748B]">
          <span>NextGenToolkit · 25 Browser Utilities · LSI Indexed</span>
          <span>Press Esc to close</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SEO / GEO Root Files, GSC Sitemap Validator & Design System Inspector Modal
// ============================================================================

interface SeoGeoInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'llms' | 'llms-full' | 'robots' | 'sitemap' | 'design-system';
}

export function SeoGeoInspectorModal({
  isOpen,
  onClose,
  initialTab = 'llms',
}: SeoGeoInspectorModalProps) {
  const [activeTab, setActiveTab] = useState<'llms' | 'llms-full' | 'robots' | 'sitemap' | 'design-system'>(
    initialTab
  );
  const [fileContent, setFileContent] = useState<string>('Loading production root file...');
  const [customDomain, setCustomDomain] = useState<string>(() => {
    return (import.meta.env.VITE_SITE_URL || window.location.origin || 'https://utilix-5rz.pages.dev').replace(
      /\/+$/,
      ''
    );
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!isOpen || activeTab === 'design-system') return;
    const pathMap: Record<string, string> = {
      llms: '/llms.txt',
      'llms-full': '/llms-full.txt',
      robots: '/robots.txt',
      sitemap: '/sitemap.xml',
    };
    const assetPath = `${import.meta.env.BASE_URL}${pathMap[activeTab].slice(1)}`;
    fetch(assetPath)
      .then((r) => r.text())
      .then((txt) => setFileContent(txt))
      .catch(() => setFileContent('Failed to load file.'));
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const generateCustomDomainSitemap = (domainInput: string) => {
    const cleanOrigin = domainInput.trim().replace(/\/+$/, '') || 'https://utilix-5rz.pages.dev';
    const lastmod = '2025-02-20';
    const allLocs = [
      `${cleanOrigin}/`,
      ...HUBS.map((h) => `${cleanOrigin}${h.slug}`),
      ...TOOLS_CATALOG.map((t) => `${cleanOrigin}${t.canonicalPath}`),
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allLocs
      .map((loc) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`)
      .join('\n')}\n</urlset>\n`;
    setFileContent(xml);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = () => {
    const filenameMap: Record<string, string> = {
      llms: 'llms.txt',
      'llms-full': 'llms-full.txt',
      robots: 'robots.txt',
      sitemap: 'sitemap.xml',
    };
    const mime = activeTab === 'sitemap' ? 'application/xml;charset=utf-8' : 'text/plain;charset=utf-8';
    const blob = new Blob([fileContent], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filenameMap[activeTab] || 'nextgentoolkit-file.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-label="NextGenToolkit Technical SEO, GEO & Design System Inspector"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E6F2] dark:border-[#2A2E42]">
          <div className="flex items-center gap-2.5">
            <FileCode2 className="w-5 h-5 text-[#7047EB]" />
            <h2 className="text-base font-bold text-[#171927] dark:text-[#F8F7FC]">
              NextGenToolkit Technical SEO, GSC Sitemap Fix & Design System
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close inspector"
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#171927] dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-3 bg-[#F8F7FC] dark:bg-[#151824] border-b border-[#E8E6F2] dark:border-[#2A2E42]">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'sitemap', label: '/sitemap.xml (GSC Verified)' },
              { id: 'robots', label: '/robots.txt' },
              { id: 'llms', label: '/llms.txt (GEO)' },
              { id: 'llms-full', label: '/llms-full.txt (RAG)' },
              { id: 'design-system', label: 'UI & LSI Architecture' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as typeof activeTab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === t.id
                    ? 'bg-[#7047EB] text-white'
                    : 'text-[#64748B] hover:text-[#171927] dark:hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeTab !== 'design-system' && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#E8E6F2] dark:border-[#2A2E42] bg-white dark:bg-[#1C1F2E] text-[#171927] dark:text-[#F8F7FC] hover:border-[#7047EB]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy File'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#7047EB] text-white hover:bg-[#5E35D9]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          )}
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'sitemap' && (
            <div className="rounded-xl bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 dark:text-emerald-200 space-y-1">
                  <div className="font-bold">
                    Google Search Console "Couldn't fetch" Sitemap Fix Active (4-Layer Protection)
                  </div>
                  <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed">
                    1) Explicit <code>Content-Type: application/xml; charset=utf-8</code> &amp; <code>X-Content-Type-Options: nosniff</code> in <code>_headers</code> and Express routes. 2) <code>_redirects</code> rule bypassing SPA HTML fallback and trailing-slash loops on <code>/sitemap.xml</code> and <code>/sitemap-index.xml</code>. 3) Standard W3C <code>YYYY-MM-DD</code> <code>&lt;lastmod&gt;</code> dates (prevents future-timestamp rejection). 4) Dynamic origin matching below:
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="https://your-verified-domain.com"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-[#151824] border border-emerald-300 dark:border-emerald-800 text-xs font-mono text-[#171927] dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => generateCustomDomainSitemap(customDomain)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Rebuild Sitemap for This Domain
                </button>
              </div>
            </div>
          )}

          {activeTab === 'design-system' ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-[#171927] dark:text-[#F8F7FC] mb-3">
                  NextGenToolkit Brand Palette & Dark/Light Surface Tokens
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { name: 'Primary Violet', hex: '#7047EB' },
                    { name: 'Deep Slate', hex: '#253044' },
                    { name: 'Ink Primary', hex: '#171927' },
                    { name: 'Canvas Alabaster', hex: '#F8F7FC' },
                    { name: 'Pure Surface', hex: '#FFFFFF' },
                  ].map((c) => (
                    <div
                      key={c.name}
                      className="p-3 rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] bg-white dark:bg-[#151824]"
                    >
                      <div
                        className="h-12 w-full rounded-lg border border-black/10 mb-2"
                        style={{ backgroundColor: c.hex }}
                      />
                      <div className="text-xs font-bold text-[#171927] dark:text-[#F8F7FC]">{c.name}</div>
                      <div className="text-xs font-mono text-[#64748B]">{c.hex}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#171927] dark:text-[#F8F7FC] mb-3">
                  Topical Hub Accents (6 Semantic Pastel Channels)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  {[
                    { name: 'Text & SEO', hex: '#EDE7FF' },
                    { name: 'Image Studio', hex: '#E1F0FF' },
                    { name: 'PDF Studio', hex: '#FFE7EC' },
                    { name: 'Developer', hex: '#E0F7F0' },
                    { name: 'Generators', hex: '#FFF1D9' },
                    { name: 'AI Search', hex: '#F4E5FF' },
                  ].map((c) => (
                    <div
                      key={c.name}
                      className="p-3 rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] bg-white dark:bg-[#151824]"
                    >
                      <div
                        className="h-10 w-full rounded-lg border border-black/5 mb-2"
                        style={{ backgroundColor: c.hex }}
                      />
                      <div className="text-xs font-bold text-[#171927] dark:text-[#F8F7FC]">{c.name}</div>
                      <div className="text-xs font-mono text-[#64748B]">{c.hex}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F7FC] dark:bg-[#151824] border border-[#E8E6F2] dark:border-[#2A2E42] space-y-2">
                <h3 className="text-sm font-bold text-[#171927] dark:text-[#F8F7FC]">
                  SEO, AEO, GEO & Latent Semantic Indexing (LSI) Architecture
                </h3>
                <ul className="space-y-1.5 text-xs text-[#64748B] leading-relaxed">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      <strong>31 Pre-Rendered Static Routes:</strong> Build script generates standalone HTML with canonical tags and server-rendered headings for Home + 5 Hubs + 25 Tools.
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      <strong>4-Entity Schema.org @graph:</strong> Every tool injects <code>SoftwareApplication</code>, <code>HowTo</code>, <code>FAQPage</code>, and <code>BreadcrumbList</code> JSON-LD.
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      <strong>Latent Semantic Indexing (LSI) Clusters:</strong> Over 220 domain-specific LSI entities (RFCs, ISO standards, Web APIs, portal KB targets) indexed across all pages.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <pre className="p-4 rounded-xl bg-[#131520] text-[#E2E8F0] font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap">
              {fileContent}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// AI Search Grounding (gemini-4-hydrogen) & High Thinking (gemini-4-carbon) Studio Modal
// ============================================================================

interface AiStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: string;
}

export function AiWorkflowModal({ isOpen, onClose, initialContext = '' }: AiStudioModalProps) {
  const [mode, setMode] = useState<'search' | 'think'>('search');
  const [query, setQuery] = useState(
    'What are the latest Core Web Vitals LCP/INP benchmarks, LSI semantic indexing strategies, and Google Search Console sitemap best practices?'
  );
  const [contextInput, setContextInput] = useState(initialContext);
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState('');
  const [resultModel, setResultModel] = useState('');
  const [sources, setSources] = useState<{ uri: string; title: string }[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialContext) setContextInput(initialContext);
  }, [initialContext]);

  if (!isOpen) return null;

  const runAiQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (import.meta.env.VITE_STATIC_DEPLOYMENT === 'true') {
      setErrorMsg(
        'AI Search requires the optional server API and is not available in this static hosting build. All 25 browser-based utility tools remain 100% available.'
      );
      return;
    }
    if (!query.trim()) {
      setErrorMsg('Please enter a query before running the AI workflow.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setResultText('');
    setSources([]);

    try {
      const endpoint = mode === 'search' ? '/api/ai/search-grounding' : '/api/ai/deep-think';
      const payload =
        mode === 'search'
          ? { query, context: contextInput }
          : { prompt: query, codeOrData: contextInput };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Request failed.');
      } else {
        setResultText(data.text || '');
        setResultModel(data.model || '');
        setSources(data.sources || []);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Network error calling server endpoint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-label="NextGenToolkit AI Search Grounding and High-Thinking Studio"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E6F2] dark:border-[#2A2E42]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F4E5FF] text-[#7E22CE] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#171927] dark:text-[#F8F7FC]">
                NextGenToolkit Hybrid AI Workflow & Search Grounding Studio
              </h2>
              <p className="text-xs text-[#64748B]">
                Server-side proxy powered by Google Search Grounding (gemini-4-hydrogen) & High Thinking (gemini-4-carbon)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close AI Studio"
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#171927] dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-[#F8F7FC] dark:bg-[#151824] border border-[#E8E6F2] dark:border-[#2A2E42]">
            <button
              type="button"
              onClick={() => {
                setMode('search');
                setQuery(
                  'What are the latest Core Web Vitals LCP/INP benchmarks, LSI semantic indexing strategies, and Google Search Console sitemap best practices?'
                );
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                mode === 'search'
                  ? 'bg-[#7047EB] text-white'
                  : 'text-[#64748B] hover:text-[#171927] dark:hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Google Search Grounding (gemini-4-hydrogen)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('think');
                setQuery(
                  'Design an optimal client-side Web Worker + binary-search quantization algorithm to compress 4K PNGs under 50KB while preserving text legibility.'
                );
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                mode === 'think'
                  ? 'bg-[#7047EB] text-white'
                  : 'text-[#64748B] hover:text-[#171927] dark:hover:text-white'
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              <span>High-Thinking Mode (gemini-4-carbon · HIGH)</span>
            </button>
          </div>

          <form onSubmit={runAiQuery} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#171927] dark:text-[#F8F7FC] mb-1">
                {mode === 'search'
                  ? 'Live Web Search & Grounding Query'
                  : 'Complex Engineering, Regex, Schema, or Architecture Query'}
              </label>
              <textarea
                rows={2}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] bg-[#F8F7FC] dark:bg-[#151824] px-3.5 py-2.5 text-sm text-[#171927] dark:text-[#F8F7FC] focus:outline-none focus:border-[#7047EB]"
                placeholder="Ask a question..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] mb-1">
                Optional Code / JSON / SEO Context Snippet
              </label>
              <textarea
                rows={2}
                value={contextInput}
                onChange={(e) => setContextInput(e.target.value)}
                className="w-full rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] bg-[#F8F7FC] dark:bg-[#151824] px-3.5 py-2 text-xs font-mono text-[#171927] dark:text-[#F8F7FC] focus:outline-none focus:border-[#7047EB]"
                placeholder="Paste optional JSON, Regex, or tool output context here..."
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-xs text-[#64748B]">
                <span>
                  {mode === 'search'
                    ? 'Uses googleSearch tool for live web citations'
                    : 'Uses ThinkingLevel.HIGH for deep multi-step reasoning'}
                </span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-[#7047EB] hover:bg-[#5E35D9] disabled:opacity-50 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                {loading
                  ? mode === 'search'
                    ? 'Searching Google & Synthesizing...'
                    : 'Deep Thinking (HIGH)...'
                  : mode === 'search'
                    ? 'Run Grounded Search'
                    : 'Run High-Thinking Analysis'}
              </button>
            </div>
          </form>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-xs text-red-700 dark:text-red-300">
              {errorMsg}
            </div>
          )}

          {resultText && (
            <div className="p-4 rounded-xl bg-[#F8F7FC] dark:bg-[#151824] border border-[#E8E6F2] dark:border-[#2A2E42] space-y-3">
              <div className="flex items-center justify-between text-xs text-[#64748B] border-b border-[#E8E6F2] dark:border-[#2A2E42] pb-2">
                <span className="font-semibold text-[#7047EB]">{resultModel}</span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(resultText)}
                  className="hover:text-[#171927] dark:hover:text-white font-medium"
                >
                  Copy Response
                </button>
              </div>
              <div className="text-xs sm:text-sm text-[#171927] dark:text-[#E2E8F0] whitespace-pre-wrap leading-relaxed">
                {resultText}
              </div>

              {sources.length > 0 && (
                <div className="pt-3 border-t border-[#E8E6F2] dark:border-[#2A2E42]">
                  <div className="text-xs font-semibold text-[#171927] dark:text-[#F8F7FC] mb-2">
                    Google Search Grounding Citations ({sources.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sources.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] text-xs text-[#7047EB] hover:underline"
                      >
                        <span className="truncate max-w-[220px]">{s.title}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
