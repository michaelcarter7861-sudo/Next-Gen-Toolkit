/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense, useState, useEffect, useMemo } from 'react';
import {
  Search,
  Sun,
  Moon,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Download,
  FileText,
  Image as ImageIcon,
  Code2,
  Type,
  Calculator,
  QrCode,
  Percent,
  Star,
  Clock,
  Cpu,
  ChevronDown,
  Menu,
  ExternalLink,
  Link2,
  BookOpen,
} from 'lucide-react';
import {
  HUBS,
  TOOLS_CATALOG,
  PLATFORM_LSI_CLUSTERS,
  HubId,
  getToolById,
  getHubById,
  getToolsByHub,
} from './data/toolsCatalog';

// Counts come from the catalogue so they cannot drift from reality.
// Owner decision (2026-11-16): keep the AI assistant code, but do not advertise
// it until a backend actually exists. No entry point is rendered while false.
const AI_ASSISTANT_ENABLED = false;

const LIVE_TOOL_COUNT = TOOLS_CATALOG.filter((tool) => tool.status !== 'preview').length;
const BROWSER_LOCAL_COUNT = LIVE_TOOL_COUNT;
import { HOME_FAQS } from './data/seoSchemaData';
import { SchemaHeadInjector } from './components/SchemaHeadInjector';
import { CommandModal, AiWorkflowModal } from './components/CommandModal';
import type { ChainedToolPayload } from './components/ToolWorkspace';

// Keep the heavier file-processing workspace out of the initial homepage bundle.
const ToolWorkspace = lazy(() =>
  import('./components/ToolWorkspace').then((module) => ({ default: module.ToolWorkspace }))
);
import { CategoryHubView } from './components/CategoryHubView';
import { SeoSitemapView } from './components/SeoSitemapView';
import { GlobalSidebarDrawer } from './components/GlobalSidebarDrawer';
import { RichSeoText } from './components/RichSeoText';

const FAVORITES_STORAGE_KEY = 'ngt_favorites_v1';
const RECENT_STORAGE_KEY = 'ngt_recent_v1';

export default function App() {
  const [activeView, setActiveView] = useState<'home' | 'hub' | 'tool' | 'sitemap'>('home');
  const [selectedHubId, setSelectedHubId] = useState<HubId>('image-tools');
  const [selectedToolId, setSelectedToolId] = useState<string>('compress-image-to-kb');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('ngt_theme_v1');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    } catch {
      return false;
    }
  });

  // Homepage live search query & quick-category filter
  const [heroSearch, setHeroSearch] = useState<string>('');
  const [quickFilter, setQuickFilter] = useState<'featured' | 'all' | 'favorites' | HubId>('featured');

  // Favorites & Recently Used Tools (persisted in localStorage)
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['compress-image-to-kb', 'merge-pdf', 'json-formatter-validator'];
    } catch {
      return ['compress-image-to-kb', 'merge-pdf', 'json-formatter-validator'];
    }
  });

  const [recentIds, setRecentIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals, Sidebar Drawer & 1-Click Tool Chaining state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isCommandOpen, setIsCommandOpen] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [aiModalContext, setAiModalContext] = useState<string>('');
  const [chainedPayload, setChainedPayload] = useState<ChainedToolPayload | null>(null);

  const toggleFavorite = (toolId: string) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId];
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  const recordRecentTool = (toolId: string) => {
    setRecentIds((prev) => {
      const next = [toolId, ...prev.filter((id) => id !== toolId)].slice(0, 6);
      try {
        localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  // Toggle dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', darkMode);
    try {
      localStorage.setItem('ngt_theme_v1', darkMode ? 'dark' : 'light');
    } catch {
      // Ignore storage errors (private mode, quota).
    }
  }, [darkMode]);

  // Sync initial route and popstate with canonical URLs (/hub-slug/tool-slug/)
  useEffect(() => {
    const syncFromPath = () => {
      const basePath = import.meta.env.BASE_URL;
      const publicPath = window.location.pathname;
      const appPath =
        basePath !== '/' && publicPath.startsWith(basePath)
          ? `/${publicPath.slice(basePath.length)}`
          : publicPath;
      const path = appPath.replace(/\/+$/, '');
      if (!path || path === '') {
        setActiveView('home');
        return;
      }
      if (path === '/sitemap' || path === '/html-sitemap') {
        setActiveView('sitemap');
        return;
      }
      const matchedTool = TOOLS_CATALOG.find(
        (t) => t.canonicalPath.replace(/\/+$/, '') === path || `/${t.slug}` === path
      );
      if (matchedTool) {
        setSelectedToolId(matchedTool.id);
        setSelectedHubId(matchedTool.hubId);
        setActiveView('tool');
        return;
      }
      const matchedHub = HUBS.find((h) => h.slug.replace(/\/+$/, '') === path);
      if (matchedHub) {
        setSelectedHubId(matchedHub.id);
        setActiveView('hub');
      }
    };

    syncFromPath();
    window.addEventListener('popstate', syncFromPath);
    return () => window.removeEventListener('popstate', syncFromPath);
  }, []);

  // Global Ctrl+K shortcut for Quick-Switch Command Bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const basePath = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const toPublicPath = (path: string) => `${basePath}${path.replace(/^\/+/, '')}`;

  const navigateToHome = () => {
    setActiveView('home');
    window.history.pushState({}, '', toPublicPath('/'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToSitemap = () => {
    setChainedPayload(null);
    setActiveView('sitemap');
    window.history.pushState({}, '', toPublicPath('/sitemap/'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToHomeSection = (sectionId: string) => {
    if (activeView !== 'home') {
      setActiveView('home');
      window.history.pushState({}, '', toPublicPath('/'));
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigateToHub = (hubId: HubId) => {
    const hub = getHubById(hubId);
    setChainedPayload(null);
    setSelectedHubId(hubId);
    setActiveView('hub');
    if (hub) window.history.pushState({}, '', toPublicPath(hub.slug));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToTool = (toolId: string, preset?: { kb?: number }) => {
    const found = getToolById(toolId);
    if (found) {
      setChainedPayload(null);
      setSelectedToolId(found.id);
      setSelectedHubId(found.hubId);
      setActiveView('tool');
      recordRecentTool(found.id);
      const query = preset?.kb ? `?kb=${preset.kb}` : '';
      window.history.pushState({}, '', `${toPublicPath(found.canonicalPath)}${query}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleChainToTool = (targetToolId: string, payload: ChainedToolPayload) => {
    const found = getToolById(targetToolId);
    if (found) {
      setChainedPayload(payload);
      setSelectedToolId(found.id);
      setSelectedHubId(found.hubId);
      setActiveView('tool');
      recordRecentTool(found.id);
      window.history.pushState({}, '', toPublicPath(found.canonicalPath));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openAiModal = (ctx = '') => {
    setAiModalContext(ctx);
    setIsAiModalOpen(true);
  };

  const activeTool = activeView === 'tool' ? getToolById(selectedToolId) ?? null : null;
  const activeHub = activeView === 'hub' ? getHubById(selectedHubId) ?? null : null;

  // Filtered tools for homepage live search
  const homeSearchTrimmed = heroSearch.trim().toLowerCase();
  const homeFilteredTools = useMemo(() => {
    if (!homeSearchTrimmed) return [];
    return TOOLS_CATALOG.filter(
      (t) =>
        t.name.toLowerCase().includes(homeSearchTrimmed) ||
        t.shortDesc.toLowerCase().includes(homeSearchTrimmed) ||
        t.primaryKeyword.toLowerCase().includes(homeSearchTrimmed) ||
        t.lsiKeywords.some((k) => k.toLowerCase().includes(homeSearchTrimmed)) ||
        t.clusteredQueries.some((q) => q.toLowerCase().includes(homeSearchTrimmed))
    );
  }, [homeSearchTrimmed]);

  // 6 Popular Flagship Tools
  const popularCards = [
    {
      toolId: 'compress-image-to-kb',
      path: '/image-tools/compress-image-to-kb/',
      title: 'Image Compressor',
      desc: 'Reduce image file size to exact KB targets without losing quality.',
      bg: '#EDE7FF',
      fg: '#7047EB',
      icon: <ImageIcon className="w-5 h-5" aria-hidden="true" />,
    },
    {
      toolId: 'merge-pdf',
      path: '/pdf-tools/merge-pdf/',
      title: 'PDF Merger',
      desc: 'Combine multiple PDF files into one unified document locally.',
      bg: '#FFE7EC',
      fg: '#E11D48',
      icon: <FileText className="w-5 h-5" aria-hidden="true" />,
    },
    {
      toolId: 'word-counter-density',
      path: '/text-tools/word-counter-density/',
      title: 'Word Counter',
      desc: 'Count words, characters, paragraphs and keyword density.',
      bg: '#E1F0FF',
      fg: '#1D4ED8',
      icon: <Type className="w-5 h-5" aria-hidden="true" />,
    },
    {
      toolId: 'custom-qr-code-generator',
      path: '/generators/custom-qr-code-generator/',
      title: 'QR Code Generator',
      desc: 'Create custom vector SVG and PNG QR codes immediately.',
      bg: '#E0F7F0',
      fg: '#047857',
      icon: <QrCode className="w-5 h-5" aria-hidden="true" />,
    },
    {
      toolId: 'json-formatter-validator',
      path: '/dev-tools/json-formatter-validator/',
      title: 'JSON Formatter & Fixer',
      desc: 'Format, validate, minify and repair malformed JSON data.',
      bg: '#EDE7FF',
      fg: '#6D28D9',
      icon: <Code2 className="w-5 h-5" aria-hidden="true" />,
    },
    {
      toolId: 'llm-token-counter',
      path: '/dev-tools/llm-token-counter/',
      title: 'Token & Cost Calculator',
      desc: 'Calculate LLM prompt tokens and API cost across modern models.',
      bg: '#FFF1D9',
      fg: '#D97706',
      icon: <Percent className="w-5 h-5" aria-hidden="true" />,
    },
  ];

  // Dynamic tool cards based on quickFilter
  const workbenchTools = useMemo(() => {
    if (quickFilter === 'featured') return null; // Uses popularCards
    if (quickFilter === 'all') return TOOLS_CATALOG;
    if (quickFilter === 'favorites') {
      return TOOLS_CATALOG.filter((t) => favoriteIds.includes(t.id));
    }
    return getToolsByHub(quickFilter);
  }, [quickFilter, favoriteIds]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FC] dark:bg-[#131520] text-[#171927] dark:text-[#F8F7FC] transition-colors">
      {/* Keyboard Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-[#7047EB] focus:text-white focus:text-xs focus:font-bold focus:shadow-lg"
      >
        Skip to main content
      </a>

      <SchemaHeadInjector
        activeTool={activeTool}
        activeHub={activeHub}
        isSitemapView={activeView === 'sitemap'}
      />

      {/* =====================================================================
          ZONE 1: Global Header & Quick-Switch Command Bar (3-Zone Top Bar Contract)
      ===================================================================== */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#171927]/90 backdrop-blur-md border-b border-[#E8E6F2] dark:border-[#2A2E42]">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-6">
          {/* Zone 1: Global Sidebar Menu Trigger + Single-line Brand Title */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open all tools menu"
              className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-[#F8F7FC] dark:bg-[#252A3F] border border-[#E8E6F2] dark:border-[#2A2E42] text-xs font-bold text-[#171927] dark:text-white hover:border-[#7047EB] hover:text-[#7047EB] transition-colors cursor-pointer"
            >
              <Menu className="w-4 h-4 text-[#7047EB]" aria-hidden="true" />
              <span className="hidden sm:inline">All Tools</span>
            </button>

            <a
              href={toPublicPath('/')}
              onClick={(e) => {
                e.preventDefault();
                navigateToHome();
              }}
              className="flex items-center gap-2 text-base sm:text-lg font-extrabold tracking-tight text-[#171927] dark:text-white whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7047EB] to-[#5E35D9] text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
                NG
              </span>
              <span>NextGenToolkit</span>
            </a>
          </div>

          {/* Zone 2: 5 Clean Category Navigation Links (Crawlable <a> tags) */}
          <nav
            aria-label="Primary Categories"
            className="hidden lg:flex items-center gap-6 text-sm font-semibold text-[#253044] dark:text-[#CBD5E1]"
          >
            {HUBS.map((hub) => (
              <a
                key={hub.id}
                href={toPublicPath(hub.slug)}
                onClick={(e) => {
                  e.preventDefault();
                  navigateToHub(hub.id);
                }}
                className={`hover:text-[#7047EB] dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeView === 'hub' && selectedHubId === hub.id
                    ? 'text-[#7047EB] dark:text-[#A78BFA] font-bold'
                    : ''
                }`}
              >
                {hub.shortTitle === 'Calculators' ? 'Calculators' : hub.name}
              </a>
            ))}
          </nav>

          {/* Zone 3: Quick-Switch Search, Theme Toggle & Primary Action */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsCommandOpen(true)}
              aria-label="Quick search tools (Ctrl+K)"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F8F7FC] dark:bg-[#252A3F] border border-[#E8E6F2] dark:border-[#2A2E42] text-xs font-semibold text-[#64748B] dark:text-[#CBD5E1] hover:border-[#7047EB] transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-[#7047EB]" aria-hidden="true" />
              <span>Quick Switch</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#171927] text-[10px] font-mono border border-[#E8E6F2] dark:border-[#2A2E42]">
                ⌘K
              </kbd>
            </button>
            <button
              type="button"
              onClick={() => setIsCommandOpen(true)}
              aria-label="Quick search tools"
              className="sm:hidden p-2 rounded-xl text-[#253044] dark:text-[#CBD5E1] hover:bg-[#F8F7FC] dark:hover:bg-[#252A3F] transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-xl text-[#253044] dark:text-[#CBD5E1] hover:bg-[#F8F7FC] dark:hover:bg-[#252A3F] transition-colors cursor-pointer"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsCommandOpen(true)}
              className="hidden sm:inline-flex px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#7047EB] hover:bg-[#5E35D9] text-white text-xs sm:text-sm font-bold shadow-sm shadow-[#7047EB]/25 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Explore Tools
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================================
          MAIN VIEWPORT ROUTER (Master Homepage | Category Hub | Tool Workspace)
      ===================================================================== */}
      <main id="main-content" className="flex-1">
        {activeView === 'sitemap' ? (
          <SeoSitemapView
            onNavigateHome={navigateToHome}
            onSelectHub={navigateToHub}
            onSelectTool={navigateToTool}
          />
        ) : activeView === 'tool' && activeTool ? (
          <Suspense fallback={<div className="mx-auto max-w-[1200px] px-4 py-16 text-center text-sm text-[#475569]" role="status">Loading tool workspace…</div>}>
          <ToolWorkspace
            tool={activeTool}
            onNavigateHome={navigateToHome}
            onSelectHub={navigateToHub}
            onSelectTool={navigateToTool}
            onOpenAiModal={openAiModal}
            aiAssistantEnabled={AI_ASSISTANT_ENABLED}
            isFavorite={favoriteIds.includes(activeTool.id)}
            onToggleFavorite={toggleFavorite}
            chainedPayload={chainedPayload}
            onChainToTool={handleChainToTool}
          />
          </Suspense>
        ) : activeView === 'hub' && activeHub ? (
          <CategoryHubView
            hub={activeHub}
            onNavigateHome={navigateToHome}
            onSelectTool={navigateToTool}
            onSelectHub={navigateToHub}
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
          />
        ) : (
          /* MASTER HOMEPAGE (Clean Hero without SEO Sitemap/Schema Clutter at Top) */
          <div className="space-y-14 pb-16">
            {/* HERO SECTION */}
            <section className="ngt-sheen relative overflow-hidden pt-6 pb-10 sm:pt-8 sm:pb-12 border-b border-[#E8E6F2]/70 dark:border-[#2A2E42]/60 bg-[#F8F7FC] dark:bg-[#131520]">
              <div className="max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                {/* Left / Center Hero Column */}
                <div className="lg:col-span-7 text-center lg:text-left space-y-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#7047EB] dark:text-[#A78BFA]">
                    {LIVE_TOOL_COUNT} tools available now · {BROWSER_LOCAL_COUNT} process files entirely on your device
                  </p>

                  <h1
                    className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-[#171927] dark:text-white tracking-tight leading-[1.12]"
                    style={{ textWrap: 'balance' }}
                  >
                    Free PDF, image, text &amp; developer tools
                    <span className="block text-[#7047EB] dark:text-[#9F7AEA]">
                      that run in your browser.
                    </span>
                  </h1>

                  <p className="text-base sm:text-lg text-[#253044] dark:text-[#CBD5E1] max-w-xl mx-auto lg:mx-0">
                    Simple, powerful browser tools for everyday PDF, image, text, and developer tasks. Many core tools process locally; AI and remote-service features may send the data needed for an operation to their providers.
                  </p>

                  {/* Search Bar */}
                  <div className="max-w-xl mx-auto lg:mx-0 pt-1">
                    <div className="flex items-center bg-white dark:bg-[#1C1F2E] rounded-2xl p-1.5 shadow-lg shadow-[#7047EB]/8 border border-[#E8E6F2] dark:border-[#2A2E42] focus-within:border-[#7047EB] transition-colors">
                      <Search className="w-5 h-5 text-[#64748B] ml-3.5 shrink-0" aria-hidden="true" />
                      <input
                        type="text"
                        value={heroSearch}
                        onChange={(e) => setHeroSearch(e.target.value)}
                        placeholder="Search for tools... (e.g. image compressor, PDF merge, word counter)"
                        className="w-full px-3 py-2.5 text-sm bg-transparent text-[#171927] dark:text-white placeholder-[#64748B] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (homeFilteredTools.length > 0) {
                            navigateToTool(homeFilteredTools[0].id);
                          } else {
                            setIsCommandOpen(true);
                          }
                        }}
                        aria-label="Search tools"
                        className="px-5 py-2.5 rounded-xl bg-[#7047EB] hover:bg-[#5E35D9] text-white font-semibold transition-colors shrink-0 cursor-pointer"
                      >
                        <Search className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>

                    {/* Exact-size entry point: the one job this site does better
                        than the big suites, one click from the first screen. */}
                    <div className="mt-3 flex flex-wrap items-center justify-center lg:justify-start gap-2">
                      <span className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
                        Need a photo under a size limit?
                      </span>
                      {([20, 50, 100] as const).map((kb) => (
                        <button
                          key={kb}
                          type="button"
                          onClick={() => navigateToTool('compress-image-to-kb', { kb })}
                          className="min-h-9 px-2.5 rounded-lg border border-[#D9D5EC] dark:border-[#2A2E42] bg-white dark:bg-[#1C1F2E] text-xs font-bold tabular-nums text-[#171927] dark:text-white hover:border-[#7047EB] hover:text-[#7047EB] transition-colors"
                        >
                          {kb} KB
                        </button>
                      ))}
                    </div>

                    {/* Live Search Dropdown Results */}
                    {homeSearchTrimmed && (
                      <div className="mt-2 rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] shadow-xl p-2 max-h-72 overflow-y-auto text-left">
                        {homeFilteredTools.length === 0 ? (
                          <div className="p-3 text-xs text-[#64748B]">
                            No matching tools found for &quot;{heroSearch}&quot;.
                          </div>
                        ) : (
                          homeFilteredTools.map((t) => (
                            <a
                              key={t.id}
                              href={toPublicPath(t.canonicalPath)}
                              onClick={(e) => {
                                e.preventDefault();
                                navigateToTool(t.id);
                              }}
                              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#F8F7FC] dark:hover:bg-[#252A3F] text-left cursor-pointer"
                            >
                              <div className="min-w-0 pr-3">
                                <div className="text-xs font-bold text-[#171927] dark:text-white flex items-center gap-2">
                                  <span>{t.name}</span>
                                  <span className="text-[10px] font-medium text-[#7047EB] bg-[#EDE7FF] dark:bg-[#7047EB]/20 px-1.5 py-0.5 rounded">
                                    {t.subCategory}
                                  </span>
                                </div>
                                <div className="text-xs text-[#64748B] truncate">{t.shortDesc}</div>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-[#7047EB] shrink-0" aria-hidden="true" />
                            </a>
                          ))
                        )}
                      </div>
                    )}

                    {/* Popular Quick-Jump Links (Crawlable <a> tags) */}
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-4 text-xs">
                      <span className="font-bold text-[#171927] dark:text-[#CBD5E1]">Popular:</span>
                      {[
                        { label: 'Image Compressor', id: 'compress-image-to-kb', path: '/image-tools/compress-image-to-kb/' },
                        { label: 'PDF Merge', id: 'merge-pdf', path: '/pdf-tools/merge-pdf/' },
                        { label: 'Word Counter', id: 'word-counter-density', path: '/text-tools/word-counter-density/' },
                        { label: 'JSON Formatter', id: 'json-formatter-validator', path: '/dev-tools/json-formatter-validator/' },
                      ].map((item) => (
                        <a
                          key={item.id}
                          href={toPublicPath(item.path)}
                          onClick={(e) => {
                            e.preventDefault();
                            navigateToTool(item.id);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] text-[#253044] dark:text-[#E2E8F0] font-semibold hover:border-[#7047EB] hover:text-[#7047EB] transition-colors cursor-pointer"
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Floating 3D-Styled App Tiles */}
                <div className="lg:col-span-5 hidden lg:flex items-center justify-center relative">
                  <div className="w-80 h-72 rounded-full bg-gradient-to-tr from-[#EDE7FF] via-[#E1F0FF] to-[#FFE7EC] dark:from-[#261E4A] dark:via-[#1C2842] dark:to-[#331C2A] blur-2xl opacity-80 absolute" />
                  <div className="relative grid grid-cols-2 gap-5 p-4">
                    <a
                      href={toPublicPath('/image-tools/')}
                      onClick={(e) => {
                        e.preventDefault();
                        navigateToHub('image-tools');
                      }}
                      className="w-28 h-28 rounded-3xl bg-[#7047EB] text-white shadow-xl shadow-[#7047EB]/30 -rotate-6 hover:rotate-0 transition-transform flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon className="w-9 h-9" aria-hidden="true" />
                      <span className="text-xs font-bold">IMAGES</span>
                    </a>
                    <a
                      href={toPublicPath('/pdf-tools/')}
                      onClick={(e) => {
                        e.preventDefault();
                        navigateToHub('pdf-tools');
                      }}
                      className="w-28 h-28 rounded-3xl bg-[#FFE7EC] text-[#E11D48] border border-white shadow-xl rotate-6 hover:rotate-0 transition-transform flex flex-col items-center justify-center gap-1.5 mt-4 cursor-pointer"
                    >
                      <FileText className="w-9 h-9" aria-hidden="true" />
                      <span className="text-xs font-extrabold">PDF</span>
                    </a>
                    <a
                      href={toPublicPath('/text-tools/')}
                      onClick={(e) => {
                        e.preventDefault();
                        navigateToHub('text-tools');
                      }}
                      className="w-28 h-28 rounded-3xl bg-[#E1F0FF] text-[#1D4ED8] border border-white shadow-xl rotate-3 hover:rotate-0 transition-transform flex flex-col items-center justify-center gap-1.5 -mt-2 cursor-pointer"
                    >
                      <Type className="w-9 h-9" aria-hidden="true" />
                      <span className="text-xs font-extrabold">TEXT</span>
                    </a>
                    <a
                      href={toPublicPath('/dev-tools/')}
                      onClick={(e) => {
                        e.preventDefault();
                        navigateToHub('dev-tools');
                      }}
                      className="w-28 h-28 rounded-3xl bg-[#FFF1D9] text-[#D97706] border border-white shadow-xl -rotate-3 hover:rotate-0 transition-transform flex flex-col items-center justify-center gap-1.5 mt-2 cursor-pointer"
                    >
                      <Code2 className="w-9 h-9" aria-hidden="true" />
                      <span className="text-xs font-extrabold">DEV &amp; AI</span>
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* 5 TOOL CATEGORY HUBS + AI SEARCH SHORTCUT */}
            <section className="max-w-[1200px] mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  {
                    title: 'Text Tools',
                    desc: 'Edit, convert and analyze text.',
                    bg: '#EDE7FF',
                    fg: '#6D28D9',
                    href: '/text-tools/',
                    hubId: 'text-tools' as HubId,
                    icon: <Type className="w-5 h-5" aria-hidden="true" />,
                  },
                  {
                    title: 'Image Tools',
                    desc: 'Compress, resize and convert images.',
                    bg: '#E1F0FF',
                    fg: '#1D4ED8',
                    href: '/image-tools/',
                    hubId: 'image-tools' as HubId,
                    icon: <ImageIcon className="w-5 h-5" aria-hidden="true" />,
                  },
                  {
                    title: 'PDF Tools',
                    desc: 'Merge, split and manage PDF files.',
                    bg: '#FFE7EC',
                    fg: '#E11D48',
                    href: '/pdf-tools/',
                    hubId: 'pdf-tools' as HubId,
                    icon: <FileText className="w-5 h-5" aria-hidden="true" />,
                  },
                  {
                    title: 'Developer Tools',
                    desc: 'Format, encode and work with code.',
                    bg: '#E0F7F0',
                    fg: '#047857',
                    href: '/dev-tools/',
                    hubId: 'dev-tools' as HubId,
                    icon: <Code2 className="w-5 h-5" aria-hidden="true" />,
                  },
                  {
                    title: 'Calculators',
                    desc: 'Everyday calculation & generator tools.',
                    bg: '#FFF1D9',
                    fg: '#D97706',
                    href: '/generators/',
                    hubId: 'generators' as HubId,
                    icon: <Calculator className="w-5 h-5" aria-hidden="true" />,
                  },
                ].map((cat) => (
                  <a
                    key={cat.title}
                    href={toPublicPath(cat.href)}
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToHub(cat.hubId);
                    }}
                    style={{ backgroundColor: darkMode ? undefined : cat.bg }}
                    className="group p-5 rounded-2xl border border-[#E8E6F2] dark:border-[#2A2E42] dark:bg-[#1C1F2E] text-left transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer flex flex-col justify-between"
                  >
                    <div
                      className="w-10 h-10 rounded-xl bg-white dark:bg-[#252A3F] flex items-center justify-center mb-4 shadow-2xs"
                      style={{ color: cat.fg }}
                    >
                      {cat.icon}
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-[#171927] dark:text-white group-hover:text-[#7047EB] transition-colors">
                        {cat.title}
                      </h2>
                      <p className="text-xs text-[#253044]/80 dark:text-[#94A3B8] mt-1 leading-relaxed">
                        {cat.desc}
                      </p>
                    </div>
                  </a>
                ))}

                {AI_ASSISTANT_ENABLED && (
<button
                  type="button"
                  onClick={() => openAiModal('')}
                  style={{ backgroundColor: darkMode ? undefined : '#F4E5FF' }}
                  className="group p-5 rounded-2xl border border-[#E8E6F2] dark:border-[#2A2E42] dark:bg-[#1C1F2E] text-left transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer flex flex-col justify-between"
                >
                  <div
                    className="w-10 h-10 rounded-xl bg-white dark:bg-[#252A3F] flex items-center justify-center mb-4 shadow-2xs"
                    style={{ color: '#7E22CE' }}
                  >
                    <Sparkles className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#171927] dark:text-white group-hover:text-[#7047EB] transition-colors">
                      AI Tools
                    </h2>
                    <p className="text-xs text-[#253044]/80 dark:text-[#94A3B8] mt-1 leading-relaxed">
                      Smart grounded search &amp; high thinking.
                    </p>
                  </div>
                </button>
                  )}
              </div>
            </section>

            {/* POPULAR & QUICK-FILTER WORKBENCH SECTION */}
            <section id="popular-workbench" className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#171927] dark:text-white tracking-tight">
                    Popular Tools
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Pin your favorite utilities with a star or filter by category.
                  </p>
                </div>

                {/* Quick Filter Tabs */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'featured', label: 'Featured (6)' },
                    { id: 'all', label: 'All 25 Tools' },
                    { id: 'favorites', label: `★ Pinned (${favoriteIds.length})` },
                    { id: 'pdf-tools', label: 'PDF' },
                    { id: 'image-tools', label: 'Images' },
                    { id: 'dev-tools', label: 'Developer' },
                    { id: 'text-tools', label: 'Text' },
                    { id: 'generators', label: 'Generators' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setQuickFilter(tab.id as typeof quickFilter)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        quickFilter === tab.id
                          ? 'bg-[#7047EB] text-white shadow-xs'
                          : 'bg-white dark:bg-[#1C1F2E] text-[#253044] dark:text-[#CBD5E1] border border-[#E8E6F2] dark:border-[#2A2E42] hover:border-[#7047EB]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Render Featured 6 Cards OR Filtered Workbench Cards */}
              {quickFilter === 'featured' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {popularCards.map((card) => {
                    const isPinned = favoriteIds.includes(card.toolId);
                    return (
                      <div
                        key={card.toolId}
                        className="group p-5 rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] hover:border-[#7047EB] transition-all text-left flex items-center justify-between gap-3 shadow-2xs hover:shadow-md"
                      >
                        <a
                          href={toPublicPath(card.path)}
                          onClick={(e) => {
                            e.preventDefault();
                            navigateToTool(card.toolId);
                          }}
                          className="flex items-start gap-4 min-w-0 flex-1 text-left cursor-pointer"
                        >
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                            style={{ backgroundColor: card.bg, color: card.fg }}
                          >
                            {card.icon}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-[#171927] dark:text-white group-hover:text-[#7047EB] transition-colors truncate">
                              {card.title}
                            </h3>
                            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 line-clamp-2">
                              {card.desc}
                            </p>
                          </div>
                        </a>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleFavorite(card.toolId)}
                            aria-label={isPinned ? 'Unpin tool' : 'Pin tool'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isPinned
                                ? 'text-amber-500 bg-amber-500/10'
                                : 'text-[#64748B] hover:text-amber-500 hover:bg-[#F8F7FC] dark:hover:bg-[#252A3F]'
                            }`}
                          >
                            <Star className={`w-4 h-4 ${isPinned ? 'fill-amber-400' : ''}`} />
                          </button>
                          <a
                            href={toPublicPath(card.path)}
                            onClick={(e) => {
                              e.preventDefault();
                              navigateToTool(card.toolId);
                            }}
                            aria-label={`Open ${card.title}`}
                            className="p-1 text-[#7047EB] cursor-pointer"
                          >
                            <ArrowRight
                              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                              aria-hidden="true"
                            />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {workbenchTools && workbenchTools.length === 0 ? (
                    <div className="col-span-full p-8 rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] text-center space-y-2">
                      <p className="text-sm font-bold text-[#171927] dark:text-white">
                        No pinned tools yet.
                      </p>
                      <p className="text-xs text-[#64748B]">
                        Click the star icon on any tool card to pin it to your personal workbench.
                      </p>
                    </div>
                  ) : (
                    workbenchTools?.map((tool) => {
                      const isPinned = favoriteIds.includes(tool.id);
                      const hub = getHubById(tool.hubId);
                      return (
                        <div
                          key={tool.id}
                          className="group p-4 rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] hover:border-[#7047EB] transition-all flex flex-col justify-between gap-3 shadow-2xs hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <a
                              href={toPublicPath(tool.canonicalPath)}
                              onClick={(e) => {
                                e.preventDefault();
                                navigateToTool(tool.id);
                              }}
                              className="text-left min-w-0 flex-1 cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-2.5 h-2.5 rounded-xs shrink-0"
                                  style={{ backgroundColor: hub?.accentFg || '#7047EB' }}
                                />
                                <h3 className="text-sm font-bold text-[#171927] dark:text-white group-hover:text-[#7047EB] transition-colors truncate">
                                  {tool.name}
                                </h3>
                              </div>
                              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 line-clamp-2">
                                {tool.shortDesc}
                              </p>
                            </a>
                            <button
                              type="button"
                              onClick={() => toggleFavorite(tool.id)}
                              aria-label={isPinned ? 'Unpin tool' : 'Pin tool'}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                                isPinned
                                  ? 'text-amber-500 bg-amber-500/10'
                                  : 'text-[#64748B] hover:text-amber-500'
                              }`}
                            >
                              <Star className={`w-4 h-4 ${isPinned ? 'fill-amber-400' : ''}`} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-[#E8E6F2]/60 dark:border-[#2A2E42]/60">
                            <div className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] truncate">
                              {tool.subCategory} · <span className="font-mono">{tool.specTable.supportedFormats}</span>
                            </div>
                            <a
                              href={toPublicPath(tool.canonicalPath)}
                              onClick={(e) => {
                                e.preventDefault();
                                navigateToTool(tool.id);
                              }}
                              className="text-xs font-bold text-[#7047EB] flex items-center gap-1 cursor-pointer shrink-0"
                            >
                              <span>Launch</span>
                              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                            </a>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Recently Used Strip */}
              {recentIds.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#64748B]">
                    <Clock className="w-3.5 h-3.5 text-[#7047EB]" aria-hidden="true" />
                    <span>Recently Used:</span>
                  </span>
                  {recentIds.map((id) => {
                    const tool = getToolById(id);
                    if (!tool) return null;
                    return (
                      <a
                        key={id}
                        href={toPublicPath(tool.canonicalPath)}
                        onClick={(e) => {
                          e.preventDefault();
                          navigateToTool(id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] text-xs font-semibold text-[#253044] dark:text-[#CBD5E1] hover:border-[#7047EB] hover:text-[#7047EB] transition-colors cursor-pointer"
                      >
                        {tool.name}
                      </a>
                    );
                  })}
                </div>
              )}
            </section>

            {/* TOOL PROCESSING & PRIVACY DISCLOSURE */}
            <section className="max-w-[1200px] mx-auto px-4 sm:px-6">
              <div className="rounded-3xl bg-gradient-to-r from-[#EDE7FF] via-[#F4F1FF] to-[#E1F0FF] dark:from-[#1E1B36] dark:via-[#1C1F2E] dark:to-[#182238] border border-[#DDD6FE] dark:border-[#37306B] p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#252142] text-[#7047EB] flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldCheck className="w-7 h-7" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#171927] dark:text-white">
                      Local Processing on Core Tools
                    </h2>
                    <p className="text-xs sm:text-sm text-[#253044] dark:text-[#CBD5E1] mt-0.5">
                      Many core file and text utilities process inputs in your browser. Google Tag Manager and Analytics may separately receive page and interaction events. AI-powered and other remote-service features may send required data to the relevant provider; check each tool's processing notes before using sensitive information.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 text-xs font-semibold text-[#171927] dark:text-[#E2E8F0] shrink-0">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>Core file tools process supported inputs locally</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>Remote features are identified in their processing notes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>Check each tool's browser and device requirements</span>
                  </div>
                </div>
              </div>
            </section>

            {/* WHY NEXTGENTOOLKIT IS DIFFERENT (Comparison & Product Value Matrix) */}
            <section className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#171927] dark:text-white tracking-tight">
                    Why Users Switch to NextGenToolkit
                  </h2>
                  <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                    Built to solve the four biggest frustrations with traditional cloud utility websites.
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#7047EB] tabular-nums">
                  Local Processing for Supported Core Tools
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] shadow-2xs">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead className="bg-[#F8F7FC] dark:bg-[#171927] border-b border-[#E8E6F2] dark:border-[#2A2E42]">
                    <tr>
                      <th className="py-3.5 px-4 font-bold text-[#171927] dark:text-white">
                        Real User Need
                      </th>
                      <th className="py-3.5 px-4 font-bold text-[#64748B]">
                        Traditional Online Tool Sites
                      </th>
                      <th className="py-3.5 px-4 font-bold text-[#7047EB] dark:text-[#C4B5FD]">
                        NextGenToolkit Architecture
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E6F2] dark:divide-[#2A2E42]">
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-[#171927] dark:text-white">
                        Exact Portal Size Limits (20KB, 50KB, 100KB)
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B]">
                        Vague &quot;Low / Medium / High&quot; sliders that miss strict exam &amp; visa portal limits
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-700 dark:text-emerald-400">
                        1-Click{' '}
                        <a
                          href={toPublicPath('/image-tools/compress-image-to-kb/')}
                          onClick={(e) => {
                            e.preventDefault();
                            navigateToTool('compress-image-to-kb');
                          }}
                          className="underline decoration-emerald-600/50 hover:decoration-emerald-600"
                        >
                          20KB, 50KB &amp; 100KB image compression presets
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-[#171927] dark:text-white">
                        Confidential PDFs, IDs &amp; API Keys
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B]">
                        Some online tools upload inputs to remote cloud services
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-700 dark:text-emerald-400">
                        Core PDF operations process locally inside browser RAM via{' '}
                        <a
                          href="https://webassembly.org/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline decoration-emerald-600/50 hover:decoration-emerald-600"
                        >
                          WebAssembly
                        </a>{' '}
                        &amp; Canvas for supported local workflows
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-[#171927] dark:text-white">
                        Multi-Step Document &amp; Code Workflows
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B]">
                        Must download output and manually re-upload into the next tool
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-700 dark:text-emerald-400">
                        1-Click Tool Chaining pipes output directly from{' '}
                        <a
                          href={toPublicPath('/pdf-tools/merge-pdf/')}
                          onClick={(e) => {
                            e.preventDefault();
                            navigateToTool('merge-pdf');
                          }}
                          className="underline decoration-emerald-600/50 hover:decoration-emerald-600"
                        >
                          PDF Merger
                        </a>{' '}
                        to{' '}
                        <a
                          href={toPublicPath('/pdf-tools/compress-pdf/')}
                          onClick={(e) => {
                            e.preventDefault();
                            navigateToTool('compress-pdf');
                          }}
                          className="underline decoration-emerald-600/50 hover:decoration-emerald-600"
                        >
                          Offline PDF Compressor
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-[#171927] dark:text-white">
                        Batch Processing &amp; QR Longevity
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B]">
                        &quot;Max 2 files/day&quot; paywalls &amp; redirecting QR codes that expire after 14 days
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-700 dark:text-emerald-400">
                        Unlimited batch ZIP export &amp; permanent{' '}
                        <a
                          href={toPublicPath('/generators/custom-qr-code-generator/')}
                          onClick={(e) => {
                            e.preventDefault();
                            navigateToTool('custom-qr-code-generator');
                          }}
                          className="underline decoration-emerald-600/50 hover:decoration-emerald-600"
                        >
                          ISO/IEC 18004 vector SVG QR codes
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* COMPLETE 25-TOOL DIRECTORY ORGANIZED ACROSS THE 5 TOPICAL HUBS */}
            <section className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-10">
              <div className="border-b border-[#E8E6F2] dark:border-[#2A2E42] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#171927] dark:text-white tracking-tight">
                    Explore All 25 Tools by Category
                  </h2>
                  <p className="text-sm text-[#64748B] mt-0.5">
                    Organized across five categories for everyday document, media, text, and developer tasks.
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#7047EB]">
                  25 Free Browser Utilities · No Sign-Up Required
                </span>
              </div>

              {HUBS.map((hub) => {
                const hubTools = getToolsByHub(hub.id);
                return (
                  <div key={hub.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: hub.accentFg }}
                        />
                        <h3 className="text-base sm:text-lg font-bold text-[#171927] dark:text-white">
                          {hub.name}
                        </h3>
                        <span className="text-xs text-[#64748B]">{hubTools.length} tools</span>
                      </div>
                      <a
                        href={toPublicPath(hub.slug)}
                        onClick={(e) => {
                          e.preventDefault();
                          navigateToHub(hub.id);
                        }}
                        className="text-xs font-bold text-[#7047EB] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Category</span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {hubTools.map((tool) => (
                        <a
                          key={tool.id}
                          href={toPublicPath(tool.canonicalPath)}
                          onClick={(e) => {
                            e.preventDefault();
                            navigateToTool(tool.id);
                          }}
                          className="group p-4 rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] hover:border-[#7047EB] transition-all text-left flex items-center justify-between gap-3 cursor-pointer"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-[#171927] dark:text-white group-hover:text-[#7047EB] transition-colors truncate">
                                {tool.name}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-[#F8F7FC] dark:bg-[#252A3F] text-[10px] font-medium text-[#64748B] shrink-0">
                                {tool.subCategory}
                              </span>
                            </div>
                            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] line-clamp-1 mt-1">
                              {tool.shortDesc}
                            </p>
                          </div>
                          <ArrowRight
                            className="w-4 h-4 text-[#7047EB] shrink-0 group-hover:translate-x-0.5 transition-transform"
                            aria-hidden="true"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>

            {/* REAL-WORLD PROBLEM SOLVER & WORKFLOW PLAYBOOKS (Contextual Internal & External Links) */}
            <section className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6">
              <div className="rounded-3xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] p-6 sm:p-8 space-y-6 shadow-2xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E8E6F2] dark:border-[#2A2E42] pb-5">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7047EB]">
                      <Cpu className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Problem-Solving Playbooks</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#171927] dark:text-white tracking-tight">
                      Built for Real-World Deadlines &amp; Strict Technical Limits
                    </h2>
                    <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8]">
                      See how students, engineers, and operations teams chain NextGenToolkit utilities together without uploading sensitive files.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    {
                      title: 'Government, Exam & Visa Portal Submissions',
                      problem:
                        'Application portals (UPSC, SSC, DS-160, Schengen, university admissions) reject photos over 20KB–50KB or PDFs over 200KB.',
                      solution:
                        'Use 1-Click 20KB / 50KB / 100KB binary-search compression presets, strip hidden EXIF GPS metadata, and convert scans into a single compliant PDF.',
                      actions: [
                        { label: 'Compress Image to 20KB/50KB', id: 'compress-image-to-kb', path: '/image-tools/compress-image-to-kb/' },
                        { label: 'Resize Dimensions & Aspect Ratio', id: 'social-media-image-resizer', path: '/image-tools/social-media-image-resizer/' },
                        { label: 'Convert Images to PDF', id: 'image-to-pdf', path: '/pdf-tools/image-to-pdf/' },
                      ],
                    },
                    {
                      title: 'Confidential Contracts, Tax & Legal PDF Workflows',
                      problem:
                        'Sending sensitive documents to remote services may violate enterprise privacy policies; use local-only tools when handling confidential files.',
                      solution:
                        'Core PDF merging, splitting, metadata sanitizing, and compression are performed in the browser using WebAssembly; review the individual tool notes for exceptions.',
                      actions: [
                        { label: 'Merge Confidential PDFs', id: 'merge-pdf', path: '/pdf-tools/merge-pdf/' },
                        { label: 'Compress PDF Locally', id: 'compress-pdf', path: '/pdf-tools/compress-pdf/' },
                        { label: 'Sanitize PDF Metadata', id: 'pdf-metadata-cleaner', path: '/pdf-tools/pdf-metadata-cleaner/' },
                      ],
                    },
                    {
                      title: 'Developer API Debugging & LLM Cost Control',
                      problem:
                        'Malformed LLM JSON responses (trailing commas, unquoted keys, BOM characters) break parsers, and oversized prompts inflate token bills.',
                      solution:
                        'Auto-repair broken JSON structures, convert JSON arrays to CSV, inspect JWT claims offline, and benchmark token costs before deploying.',
                      actions: [
                        { label: 'Format & Auto-Fix JSON', id: 'json-formatter-validator', path: '/dev-tools/json-formatter-validator/' },
                        { label: 'Estimate LLM Token Cost', id: 'llm-token-counter', path: '/dev-tools/llm-token-counter/' },
                        { label: 'Decode JWT Claims Offline', id: 'jwt-decoder', path: '/dev-tools/jwt-decoder/' },
                      ],
                    },
                    {
                      title: 'Print-Ready Vector QR Codes & Web Performance Assets',
                      problem:
                        'Free QR generators often insert tracking redirects that expire after 14 days, while unoptimized PNG/JPEG assets slow down Core Web Vitals.',
                      solution:
                        'Generate permanent, direct-encoded ISO/IEC 18004 SVG vector QR codes and batch-transcode raster graphics to WebP with instant ZIP download.',
                      actions: [
                        { label: 'Create Vector SVG QR Code', id: 'custom-qr-code-generator', path: '/generators/custom-qr-code-generator/' },
                        { label: 'Batch Convert to WebP', id: 'bulk-webp-avif-converter', path: '/image-tools/bulk-webp-avif-converter/' },
                        { label: 'Scrub EXIF & GPS Metadata', id: 'exif-metadata-remover', path: '/image-tools/exif-metadata-remover/' },
                      ],
                    },
                  ].map((playbook) => (
                    <div
                      key={playbook.title}
                      className="p-5 rounded-2xl bg-[#F8F7FC] dark:bg-[#171927] border border-[#E8E6F2] dark:border-[#2A2E42] flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <h3 className="text-sm sm:text-base font-extrabold text-[#171927] dark:text-white">
                          {playbook.title}
                        </h3>
                        <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                          <strong className="text-[#171927] dark:text-[#E2E8F0]">The Problem:</strong>{' '}
                          <RichSeoText
                            text={playbook.problem}
                            onSelectTool={navigateToTool}
                            onSelectHub={navigateToHub}
                          />
                        </p>
                        <p className="text-xs text-[#253044] dark:text-[#CBD5E1] leading-relaxed">
                          <strong className="text-[#7047EB] dark:text-[#C4B5FD]">How We Solve It:</strong>{' '}
                          <RichSeoText
                            text={playbook.solution}
                            onSelectTool={navigateToTool}
                            onSelectHub={navigateToHub}
                          />
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E8E6F2] dark:border-[#2A2E42]">
                        {playbook.actions.map((act) => (
                          <a
                            key={act.id}
                            href={toPublicPath(act.path)}
                            onClick={(e) => {
                              e.preventDefault();
                              navigateToTool(act.id);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] text-xs font-semibold text-[#171927] dark:text-[#F8F7FC] hover:border-[#7047EB] hover:text-[#7047EB] transition-colors cursor-pointer"
                          >
                            <span>{act.label}</span>
                            <ArrowRight className="w-3 h-3 text-[#7047EB]" aria-hidden="true" />
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* POPULAR WORKFLOW SHORTCUTS & OPEN STANDARDS */}
            <section
              id="internal-and-authority-links"
              className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6"
            >
              <div className="rounded-3xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] p-6 sm:p-8 space-y-8 shadow-2xs">
                {/* Part 1: Topic-Clustered Task Shortcuts */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E6F2] dark:border-[#2A2E42] pb-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7047EB]">
                        <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Popular Workflows &amp; Task Shortcuts</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-[#171927] dark:text-white tracking-tight mt-0.5">
                        Direct Shortcuts to Specialized Browser Workflows
                      </h2>
                      <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8]">
                        Jump directly to the exact utility for your document, media, code, or security task.
                      </p>
                    </div>
                    <a
                      href={toPublicPath('/sitemap/')}
                      onClick={(e) => {
                        e.preventDefault();
                        navigateToSitemap();
                      }}
                      className="text-xs font-bold text-[#7047EB] hover:underline shrink-0"
                    >
                      View Full Site Directory →
                    </a>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {PLATFORM_LSI_CLUSTERS.map((cluster) => {
                      const hub = getHubById(cluster.hubId);
                      return (
                        <div
                          key={cluster.clusterTitle}
                          className="p-4 rounded-2xl bg-[#F8F7FC] dark:bg-[#171927] border border-[#E8E6F2] dark:border-[#2A2E42] flex flex-col justify-between space-y-3"
                        >
                          <div className="space-y-2">
                            <a
                              href={toPublicPath(hub?.slug || '/')}
                              onClick={(e) => {
                                e.preventDefault();
                                navigateToHub(cluster.hubId);
                              }}
                              className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#7047EB] hover:underline"
                            >
                              {hub?.name} →
                            </a>
                            <h3 className="text-sm font-extrabold text-[#171927] dark:text-white leading-snug">
                              {cluster.clusterTitle}
                            </h3>
                            <ul className="space-y-1.5 pt-1 text-xs">
                              {cluster.keywords.map((kw) => {
                                const targetTool = getToolById(kw.toolId);
                                if (!targetTool) return null;
                                return (
                                  <li key={kw.term}>
                                    <a
                                      href={toPublicPath(targetTool.canonicalPath)}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        navigateToTool(targetTool.id);
                                      }}
                                      className="text-[#253044] dark:text-[#CBD5E1] hover:text-[#7047EB] dark:hover:text-[#A78BFA] font-medium inline-flex items-start gap-1.5 group"
                                    >
                                      <ArrowRight
                                        className="w-3 h-3 text-[#7047EB] shrink-0 mt-1"
                                        aria-hidden="true"
                                      />
                                      <span className="underline decoration-[#CBD5E1] dark:decoration-[#334155] group-hover:decoration-[#7047EB] underline-offset-2">
                                        {kw.term}
                                      </span>
                                    </a>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Part 2: Open Standards & Technical Specifications */}
                <div className="space-y-4 pt-4 border-t border-[#E8E6F2] dark:border-[#2A2E42]">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7047EB]">
                      <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Open Standards &amp; Technical Specifications</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#171927] dark:text-white tracking-tight mt-0.5">
                      Official Specifications Backing NextGenToolkit Engines
                    </h3>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                      We link directly to the primary technical standards bodies whose specifications govern our client-side encoders and parsers.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
                    {[
                      {
                        anchor: 'ISO 32000-1 Portable Document Format',
                        url: 'https://www.iso.org/standard/51502.html',
                        org: 'ISO.org',
                        desc: 'Governs lossless PDF stream compression, page merging, and XMP packet sanitization.',
                      },
                      {
                        anchor: 'ISO/IEC 18004 QR Code Symbology',
                        url: 'https://www.iso.org/standard/62021.html',
                        org: 'ISO.org',
                        desc: 'Defines static QR matrix encoding, quiet zones, and Reed-Solomon error recovery.',
                      },
                      {
                        anchor: 'IETF RFC 8259 JSON Data Interchange',
                        url: 'https://datatracker.ietf.org/doc/html/rfc8259',
                        org: 'IETF RFC',
                        desc: 'Defines strict JSON grammar validated and repaired by our JSON Auto-Fixer.',
                      },
                      {
                        anchor: 'IETF RFC 7519 JSON Web Token (JWT)',
                        url: 'https://datatracker.ietf.org/doc/html/rfc7519',
                        org: 'IETF RFC',
                        desc: 'Specifies Base64Url header, payload, and expiration claims inspected offline.',
                      },
                      {
                        anchor: 'W3C Web Cryptography API (CSPRNG)',
                        url: 'https://www.w3.org/TR/WebCryptoAPI/',
                        org: 'W3C Standard',
                        desc: 'Provides hardware-seeded crypto.getRandomValues entropy for passwords & API keys.',
                      },
                      {
                        anchor: 'MDN HTML5 Canvas & ArrayBuffer APIs',
                        url: 'https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API',
                        org: 'MDN Web Docs',
                        desc: 'Powers browser-based image compression, WebP transcoding, and DPI rasterization for supported local operations.',
                      },
                      {
                        anchor: 'Google web.dev Core Web Vitals Guide',
                        url: 'https://web.dev/learn/images',
                        org: 'Google web.dev',
                        desc: 'Benchmarks WebP compression and responsive sizing for faster LCP performance.',
                      },
                      {
                        anchor: 'OWASP File Upload & Privacy Cheat Sheet',
                        url: 'https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html',
                        org: 'OWASP.org',
                        desc: 'Guides browser-based EXIF/XMP metadata scrubbing for supported local operations.',
                      },
                    ].map((ref) => (
                      <div
                        key={ref.url}
                        className="p-4 rounded-2xl bg-[#F8F7FC] dark:bg-[#171927] border border-[#E8E6F2] dark:border-[#2A2E42] flex flex-col justify-between gap-2"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2 py-0.5 rounded bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] text-[10px] font-bold text-[#7047EB] dark:text-[#C4B5FD]">
                              {ref.org}
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-[#7047EB] shrink-0" aria-hidden="true" />
                          </div>
                          <a
                            href={ref.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-[#171927] dark:text-white hover:text-[#7047EB] dark:hover:text-[#A78BFA] underline decoration-[#7047EB]/40 hover:decoration-[#7047EB] underline-offset-2 block leading-snug"
                          >
                            {ref.anchor}
                          </a>
                          <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                            {ref.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* HOW IT WORKS & TRUSTED OPEN STANDARDS SECTION (Contextual Internal + Outbound Authority Links) */}
            <section id="how-it-works" className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#171927] dark:text-white tracking-tight">
                How It Works &amp; Open Standards Compliance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    step: '1 Discover',
                    desc: 'Find the right tool for your task using live search, category filters, or Ctrl+K.',
                    icon: <Search className="w-5 h-5 text-[#7047EB]" aria-hidden="true" />,
                  },
                  {
                    step: '2 Use',
                    desc: 'Work immediately inside your browser with a clean, distraction-free interface.',
                    icon: <Zap className="w-5 h-5 text-[#7047EB]" aria-hidden="true" />,
                  },
                  {
                    step: '3 Download',
                    desc: 'Get your results or batch ZIP archive in seconds (no sign-up required).',
                    icon: <Download className="w-5 h-5 text-[#7047EB]" aria-hidden="true" />,
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="p-6 rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] flex items-start gap-4"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#EDE7FF] dark:bg-[#7047EB]/20 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#171927] dark:text-white">
                        {item.step}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Engineering Standards, Methodology & Outbound Trusted Authority Links */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed">
                <div className="space-y-1.5">
                  <div className="font-bold text-[#171927] dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>Tool-Specific Processing Notes</span>
                  </div>
                  <p className="text-[#64748B] dark:text-[#94A3B8]">
                    Every file you drop into NextGenToolkit is read into local browser memory via the{' '}
                    <a
                      href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#7047EB] dark:text-[#A78BFA] underline decoration-[#7047EB]/40 hover:decoration-[#7047EB]"
                    >
                      MDN JavaScript ArrayBuffer API
                    </a>{' '}
                    and garbage-collected when you close the tab. You can also{' '}
                    <a
                      href={toPublicPath('/image-tools/exif-metadata-remover/')}
                      onClick={(e) => {
                        e.preventDefault();
                        navigateToTool('exif-metadata-remover');
                      }}
                      className="font-semibold text-[#7047EB] dark:text-[#A78BFA] underline decoration-[#7047EB]/40 hover:decoration-[#7047EB]"
                    >
                      remove EXIF GPS coordinates from photos
                    </a>{' '}
                    and{' '}
                    <a
                      href={toPublicPath('/pdf-tools/pdf-metadata-cleaner/')}
                      onClick={(e) => {
                        e.preventDefault();
                        navigateToTool('pdf-metadata-cleaner');
                      }}
                      className="font-semibold text-[#7047EB] dark:text-[#A78BFA] underline decoration-[#7047EB]/40 hover:decoration-[#7047EB]"
                    >
                      scrub PDF XMP metadata
                    </a>{' '}
                    locally.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="font-bold text-[#171927] dark:text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#7047EB] shrink-0" aria-hidden="true" />
                    <span>Audited Open Specifications</span>
                  </div>
                  <p className="text-[#64748B] dark:text-[#94A3B8]">
                    Built on official industry standards:{' '}
                    <a
                      href="https://www.iso.org/standard/51502.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#7047EB] dark:text-[#A78BFA] underline decoration-[#7047EB]/40 hover:decoration-[#7047EB]"
                    >
                      ISO 32000-1 PDF specification
                    </a>{' '}
                    for document streams,{' '}
                    <a
                      href="https://www.iso.org/standard/62021.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#7047EB] dark:text-[#A78BFA] underline decoration-[#7047EB]/40 hover:decoration-[#7047EB]"
                    >
                      ISO/IEC 18004 QR Code symbology
                    </a>{' '}
                    for vector matrices,{' '}
                    <a
                      href="https://datatracker.ietf.org/doc/html/rfc8259"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#7047EB] dark:text-[#A78BFA] underline decoration-[#7047EB]/40 hover:decoration-[#7047EB]"
                    >
                      IETF RFC 8259 JSON standard
                    </a>
                    , and the{' '}
                    <a
                      href="https://www.w3.org/TR/WebCryptoAPI/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#7047EB] dark:text-[#A78BFA] underline decoration-[#7047EB]/40 hover:decoration-[#7047EB]"
                    >
                      W3C Web Cryptography API
                    </a>{' '}
                    for CSPRNG secret generation.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="font-bold text-[#171927] dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#7047EB] shrink-0" aria-hidden="true" />
                    <span>Core Web Vitals &amp; Portal Ready</span>
                  </div>
                  <p className="text-[#64748B] dark:text-[#94A3B8]">
                    Whether you need to{' '}
                    <a
                      href={toPublicPath('/image-tools/bulk-webp-avif-converter/')}
                      onClick={(e) => {
                        e.preventDefault();
                        navigateToTool('bulk-webp-avif-converter');
                      }}
                      className="font-semibold text-[#7047EB] dark:text-[#A78BFA] underline decoration-[#7047EB]/40 hover:decoration-[#7047EB]"
                    >
                      batch convert PNG and JPG to WebP
                    </a>{' '}
                    following{' '}
                    <a
                      href="https://web.dev/learn/images"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#7047EB] dark:text-[#A78BFA] underline decoration-[#7047EB]/40 hover:decoration-[#7047EB]"
                    >
                      Google web.dev image optimization guidelines
                    </a>{' '}
                    or{' '}
                    <a
                      href={toPublicPath('/dev-tools/json-formatter-validator/')}
                      onClick={(e) => {
                        e.preventDefault();
                        navigateToTool('json-formatter-validator');
                      }}
                      className="font-semibold text-[#7047EB] dark:text-[#A78BFA] underline decoration-[#7047EB]/40 hover:decoration-[#7047EB]"
                    >
                    format and repair broken JSON
                    </a>
                    , every output displays an exact millisecond speed receipt.
                  </p>
                </div>
              </div>

              {/* E-E-A-T Methodology & Verifiable Provenance (Omni Calculator & Squoosh Trust Pattern) */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#F4F1FF]/80 dark:bg-[#1E1B36] border border-[#DDD6FE] dark:border-[#37306B] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1 max-w-3xl">
                  <div className="font-extrabold text-[#171927] dark:text-white text-sm">
                    Editorial Methodology, Unit-Tested Engines &amp; Privacy Boundary
                  </div>
                  <p className="text-[#253044] dark:text-[#CBD5E1] leading-relaxed">
                    Core browser-only parsers, converters, token estimators, and PDF/image engines process their inputs locally. Some optional AI or remote-service features transmit the data needed for that feature to its provider. Processing notes are shown with individual utilities.
                  </p>
                </div>
                <div className="text-left md:text-right shrink-0 space-y-0.5 tabular-nums">
                  <div className="font-bold text-[#7047EB] dark:text-[#C4B5FD]">
                    Engine tests run in CI on every change
                  </div>
                  <div className="text-[#64748B] dark:text-[#94A3B8]">
                    Zero Paywalls · Zero Account Required
                  </div>
                </div>
              </div>
            </section>

            {/* HOMEPAGE FREQUENTLY ASKED QUESTIONS */}
            <section
              id="platform-faq"
              itemScope
              itemType="https://schema.org/FAQPage"
              className="max-w-[1200px] mx-auto px-4 sm:px-6"
            >
              <div className="rounded-3xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] p-6 sm:p-8 space-y-5 shadow-2xs">
                <div className="border-b border-[#E8E6F2] dark:border-[#2A2E42] pb-4">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#171927] dark:text-white tracking-tight">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                    Answers to common questions about local browser privacy, exact KB compression presets, and tool chaining.
                  </p>
                </div>

                <div className="divide-y divide-[#E8E6F2] dark:divide-[#2A2E42]">
                  {HOME_FAQS.map((faq, idx) => (
                    <details
                      key={idx}
                      itemScope
                      itemProp="mainEntity"
                      itemType="https://schema.org/Question"
                      className="group py-4"
                      open={idx === 0}
                    >
                      <summary className="flex items-center justify-between cursor-pointer list-none text-sm sm:text-base font-bold text-[#171927] dark:text-[#F8F7FC] hover:text-[#7047EB] transition-colors">
                        <span itemProp="name">{faq.q}</span>
                        <ChevronDown
                          className="w-4 h-4 text-[#64748B] group-open:rotate-180 transition-transform shrink-0 ml-3"
                          aria-hidden="true"
                        />
                      </summary>
                      <div
                        itemScope
                        itemProp="acceptedAnswer"
                        itemType="https://schema.org/Answer"
                        className="mt-2.5 text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed"
                      >
                        <p itemProp="text">
                          <RichSeoText
                            text={faq.a}
                            onSelectTool={navigateToTool}
                            onSelectHub={navigateToHub}
                          />
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* =====================================================================
          SEMANTIC DARK FOOTER
      ===================================================================== */}
      <footer className="bg-[#171927] text-[#CBD5E1] py-12 border-t border-[#2A2E42]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-8">
          <nav aria-label="Site information" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-[#94A3B8]">
            <a href={toPublicPath('/about/')} className="hover:text-white">About</a>
            <a href={toPublicPath('/contact/')} className="hover:text-white">Contact</a>
            <a href={toPublicPath('/privacy/')} className="hover:text-white">Privacy</a>
            <a href={toPublicPath('/terms/')} className="hover:text-white">Terms</a>
            <a href={toPublicPath('/editorial-policy/')} className="hover:text-white">Editorial policy</a>
            <a href={toPublicPath('/changelog/')} className="hover:text-white">Changelog</a>
            <a href={toPublicPath('/sitemap/')} className="hover:text-white">All tools</a>
          </nav>
        </div>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-white font-extrabold text-lg">
              <span className="w-7 h-7 rounded-lg bg-[#7047EB] text-white flex items-center justify-center text-xs">
                NG
              </span>
              <span>NextGenToolkit</span>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Free browser-based utilities for PDF, image, text, and developer tasks. Many core tools process locally; AI and remote-service features may send the data needed for the requested operation to their providers.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#94A3B8]">
              <a
                href="https://developer.mozilla.org/en-US/docs/Web/API"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white inline-flex items-center gap-0.5"
              >
                <span>MDN Web APIs</span>
                <ExternalLink className="w-2.5 h-2.5" aria-hidden="true" />
              </a>
              <span>·</span>
              <a
                href="https://www.w3.org/TR/WebCryptoAPI/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white inline-flex items-center gap-0.5"
              >
                <span>W3C WebCrypto</span>
                <ExternalLink className="w-2.5 h-2.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Popular Tools
            </h3>
            <ul className="space-y-2 text-xs text-[#94A3B8]">
              <li>
                <a
                  href={toPublicPath('/pdf-tools/compress-pdf/')}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToTool('compress-pdf');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Offline PDF Compressor
                </a>
              </li>
              <li>
                <a
                  href={toPublicPath('/image-tools/compress-image-to-kb/')}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToTool('compress-image-to-kb');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Target-KB Image Compressor
                </a>
              </li>
              <li>
                <a
                  href={toPublicPath('/dev-tools/json-formatter-validator/')}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToTool('json-formatter-validator');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  JSON Formatter &amp; Auto-Fixer
                </a>
              </li>
              <li>
                <a
                  href={toPublicPath('/generators/custom-qr-code-generator/')}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToTool('custom-qr-code-generator');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Vector SVG QR Code Studio
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Categories
            </h3>
            <ul className="space-y-2 text-xs text-[#94A3B8]">
              {HUBS.map((h) => (
                <li key={h.id}>
                  <a
                    href={toPublicPath(h.slug)}
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToHub(h.id);
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    {h.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              More Utilities
            </h3>
            <ul className="space-y-2 text-xs text-[#94A3B8]">
              <li>
                <a
                  href={toPublicPath('/pdf-tools/merge-pdf/')}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToTool('merge-pdf');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  PDF Merger &amp; Organizer
                </a>
              </li>
              <li>
                <a
                  href={toPublicPath('/image-tools/bulk-webp-avif-converter/')}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToTool('bulk-webp-avif-converter');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Bulk WebP Image Converter
                </a>
              </li>
              <li>
                <a
                  href={toPublicPath('/text-tools/word-counter-density/')}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToTool('word-counter-density');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Word Counter &amp; Density
                </a>
              </li>
              <li>
                <a
                  href={toPublicPath('/generators/password-api-key-generator/')}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToTool('password-api-key-generator');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Password &amp; API Key Generator
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Platform &amp; Help
            </h3>
            <ul className="space-y-2 text-xs text-[#94A3B8]">
              <li>
                <a
                  href={toPublicPath('/sitemap/')}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToSitemap();
                  }}
                  className="hover:text-white font-semibold text-[#C4B5FD] transition-colors cursor-pointer"
                >
                  All Tools Directory (Sitemap)
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsCommandOpen(true)}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Search All 25 Tools (⌘K)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToHomeSection('platform-faq')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToHomeSection('how-it-works')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  How It Works &amp; Standards
                </button>
              </li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Global Slide-Over Sidebar Drawer & Modals */}
      <GlobalSidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeView={activeView}
        activeHubId={selectedHubId}
        activeToolId={selectedToolId}
        onNavigateHome={navigateToHome}
        onNavigateSitemap={navigateToSitemap}
        onSelectHub={navigateToHub}
        onSelectTool={navigateToTool}
        onScrollToSection={scrollToHomeSection}
        onOpenAiModal={() => openAiModal('')}
        favoriteIds={favoriteIds}
        recentIds={recentIds}
        onToggleFavorite={toggleFavorite}
      />
      <CommandModal
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onSelectTool={navigateToTool}
        onSelectHub={navigateToHub}
        favoriteIds={favoriteIds}
        onToggleFavorite={toggleFavorite}
      />
      <AiWorkflowModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        initialContext={aiModalContext}
      />
    </div>
  );
}
