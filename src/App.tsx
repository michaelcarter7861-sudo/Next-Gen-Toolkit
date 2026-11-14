/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
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
  Tag,
  Cpu,
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
import { SchemaHeadInjector } from './components/SchemaHeadInjector';
import { CommandModal, AiWorkflowModal } from './components/CommandModal';
import { ToolWorkspace } from './components/ToolWorkspace';
import { CategoryHubView } from './components/CategoryHubView';

const FAVORITES_STORAGE_KEY = 'ngt_favorites_v1';
const RECENT_STORAGE_KEY = 'ngt_recent_v1';

export default function App() {
  const [activeView, setActiveView] = useState<'home' | 'hub' | 'tool'>('home');
  const [selectedHubId, setSelectedHubId] = useState<HubId>('image-tools');
  const [selectedToolId, setSelectedToolId] = useState<string>('compress-image-to-kb');
  const [darkMode, setDarkMode] = useState<boolean>(false);

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

  // Modals
  const [isCommandOpen, setIsCommandOpen] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [aiModalContext, setAiModalContext] = useState<string>('');

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
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
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
    setSelectedHubId(hubId);
    setActiveView('hub');
    if (hub) window.history.pushState({}, '', toPublicPath(hub.slug));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToTool = (toolId: string) => {
    const found = getToolById(toolId);
    if (found) {
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

  // 6 Popular Flagship Tools matching Panel 1 of the reference screenshot
  const popularCards = [
    {
      toolId: 'compress-image-to-kb',
      title: 'Image Compressor',
      desc: 'Reduce image file size to exact KB targets without losing quality.',
      bg: '#EDE7FF',
      fg: '#7047EB',
      icon: <ImageIcon className="w-5 h-5" />,
    },
    {
      toolId: 'merge-pdf',
      title: 'PDF Merger',
      desc: 'Combine multiple PDF files into one unified document locally.',
      bg: '#FFE7EC',
      fg: '#E11D48',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      toolId: 'word-counter-density',
      title: 'Word Counter',
      desc: 'Count words, characters, paragraphs and keyword density.',
      bg: '#E1F0FF',
      fg: '#1D4ED8',
      icon: <Type className="w-5 h-5" />,
    },
    {
      toolId: 'custom-qr-code-generator',
      title: 'QR Code Generator',
      desc: 'Create custom vector SVG and PNG QR codes immediately.',
      bg: '#E0F7F0',
      fg: '#047857',
      icon: <QrCode className="w-5 h-5" />,
    },
    {
      toolId: 'json-formatter-validator',
      title: 'JSON Formatter & Fixer',
      desc: 'Format, validate, minify and repair malformed JSON data.',
      bg: '#EDE7FF',
      fg: '#6D28D9',
      icon: <Code2 className="w-5 h-5" />,
    },
    {
      toolId: 'llm-token-counter',
      title: 'Token & Cost Calculator',
      desc: 'Calculate LLM prompt tokens and API cost across modern models.',
      bg: '#FFF1D9',
      fg: '#D97706',
      icon: <Percent className="w-5 h-5" />,
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
      <SchemaHeadInjector activeTool={activeTool} activeHub={activeHub} />

      {/* =====================================================================
          ZONE 1: Global Header & Quick-Switch Command Bar (3-Zone Top Bar Contract)
      ===================================================================== */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#171927]/90 backdrop-blur-md border-b border-[#E8E6F2] dark:border-[#2A2E42]">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-6">
          {/* Zone 1: Single-line Brand Title */}
          <button
            type="button"
            onClick={navigateToHome}
            className="flex items-center gap-2 sm:gap-2.5 text-base sm:text-lg font-extrabold tracking-tight text-[#171927] dark:text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7047EB] to-[#5E35D9] text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
              NG
            </span>
            <span>NextGenToolkit</span>
          </button>

          {/* Zone 2: 5 Concise Single-Line Navigation Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#253044] dark:text-[#CBD5E1]"
          >
            <button
              type="button"
              onClick={navigateToHome}
              className="hover:text-[#7047EB] dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Tools
            </button>
            <button
              type="button"
              onClick={() => navigateToHub('image-tools')}
              className="hover:text-[#7047EB] dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Categories
            </button>
            <button
              type="button"
              onClick={() => scrollToHomeSection('popular-workbench')}
              className="hover:text-[#7047EB] dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Popular
            </button>
            <button
              type="button"
              onClick={() => scrollToHomeSection('how-it-works')}
              className="hover:text-[#7047EB] dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => openAiModal('')}
              className="hover:text-[#7047EB] dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              AI Search
            </button>
          </nav>

          {/* Zone 3: Quick-Switch Search, Theme Toggle & Primary Action */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsCommandOpen(true)}
              aria-label="Quick search tools (Ctrl+K)"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F8F7FC] dark:bg-[#252A3F] border border-[#E8E6F2] dark:border-[#2A2E42] text-xs font-semibold text-[#64748B] dark:text-[#CBD5E1] hover:border-[#7047EB] transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-[#7047EB]" />
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
              <Search className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-xl text-[#253044] dark:text-[#CBD5E1] hover:bg-[#F8F7FC] dark:hover:bg-[#252A3F] transition-colors cursor-pointer"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setIsCommandOpen(true)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#7047EB] hover:bg-[#5E35D9] text-white text-xs sm:text-sm font-bold shadow-sm shadow-[#7047EB]/25 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Explore Tools
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================================
          MAIN VIEWPORT ROUTER (Master Homepage | Category Hub | Tool Workspace)
      ===================================================================== */}
      <main className="flex-1">
        {activeView === 'tool' && activeTool ? (
          <ToolWorkspace
            tool={activeTool}
            onNavigateHome={navigateToHome}
            onSelectHub={navigateToHub}
            onSelectTool={navigateToTool}
            onOpenAiModal={openAiModal}
            isFavorite={favoriteIds.includes(activeTool.id)}
            onToggleFavorite={toggleFavorite}
          />
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
          /* MASTER HOMEPAGE MATCHING REFERENCE DESIGN */
          <div className="space-y-14 pb-16">
            {/* HERO SECTION */}
            <section className="relative overflow-hidden pt-10 pb-12 sm:pt-14 sm:pb-16 border-b border-[#E8E6F2]/70 dark:border-[#2A2E42]/60 bg-gradient-to-b from-[#F4F0FF]/70 via-[#F8F7FC] to-[#F8F7FC] dark:from-[#1A1830] dark:via-[#131520] dark:to-[#131520]">
              <div className="max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                {/* Left / Center Hero Column */}
                <div className="lg:col-span-7 text-center lg:text-left space-y-5">
                  <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#7047EB] dark:text-[#A78BFA] px-3 py-1 rounded-full bg-[#EDE7FF]/80 dark:bg-[#7047EB]/20 border border-[#7047EB]/20">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>YOUR DIGITAL TOOLKIT · 25+ FREE UTILITIES</span>
                    </span>
                  </div>

                  <h1
                    className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-[#171927] dark:text-white tracking-tight leading-[1.12]"
                    style={{ textWrap: 'balance' }}
                  >
                    Get more done.{' '}
                    <span className="block text-[#7047EB] dark:text-[#9F7AEA]">
                      With less effort.
                    </span>
                  </h1>

                  <p className="text-base sm:text-lg text-[#253044] dark:text-[#CBD5E1] max-w-xl mx-auto lg:mx-0">
                    Simple, powerful browser tools for everyday PDF, image, text, and developer tasks. Fast, private, and free—with zero file uploads required.
                  </p>

                  {/* Search Bar matching Screenshot Panel 1 */}
                  <div className="max-w-xl mx-auto lg:mx-0 pt-1">
                    <div className="flex items-center bg-white dark:bg-[#1C1F2E] rounded-2xl p-1.5 shadow-lg shadow-[#7047EB]/8 border border-[#E8E6F2] dark:border-[#2A2E42] focus-within:border-[#7047EB] transition-colors">
                      <Search className="w-5 h-5 text-[#64748B] ml-3.5 shrink-0" />
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
                        <Search className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Live Search Dropdown Results if user types in Hero Search */}
                    {homeSearchTrimmed && (
                      <div className="mt-2 rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] shadow-xl p-2 max-h-72 overflow-y-auto text-left">
                        {homeFilteredTools.length === 0 ? (
                          <div className="p-3 text-xs text-[#64748B]">
                            No matching tools found for "{heroSearch}".
                          </div>
                        ) : (
                          homeFilteredTools.map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => navigateToTool(t.id)}
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
                              <ArrowRight className="w-3.5 h-3.5 text-[#7047EB] shrink-0" />
                            </button>
                          ))
                        )}
                      </div>
                    )}

                    {/* Popular Quick-Jump Buttons matching Screenshot Panel 1 */}
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-4 text-xs">
                      <span className="font-bold text-[#171927] dark:text-[#CBD5E1]">Popular:</span>
                      {[
                        { label: 'Image Compressor', id: 'compress-image-to-kb' },
                        { label: 'PDF Merge', id: 'merge-pdf' },
                        { label: 'Word Counter', id: 'word-counter-density' },
                        { label: 'JSON Formatter', id: 'json-formatter-validator' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => navigateToTool(item.id)}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] text-[#253044] dark:text-[#E2E8F0] font-semibold hover:border-[#7047EB] hover:text-[#7047EB] transition-colors cursor-pointer"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Floating 3D-Styled App Tiles matching Screenshot Panel 1 */}
                <div className="lg:col-span-5 hidden lg:flex items-center justify-center relative">
                  <div className="w-80 h-72 rounded-full bg-gradient-to-tr from-[#EDE7FF] via-[#E1F0FF] to-[#FFE7EC] dark:from-[#261E4A] dark:via-[#1C2842] dark:to-[#331C2A] blur-2xl opacity-80 absolute" />
                  <div className="relative grid grid-cols-2 gap-5 p-4">
                    <button
                      type="button"
                      onClick={() => navigateToHub('image-tools')}
                      className="w-28 h-28 rounded-3xl bg-[#7047EB] text-white shadow-xl shadow-[#7047EB]/30 -rotate-6 hover:rotate-0 transition-transform flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon className="w-9 h-9" />
                      <span className="text-xs font-bold">IMAGES</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateToHub('pdf-tools')}
                      className="w-28 h-28 rounded-3xl bg-[#FFE7EC] text-[#E11D48] border border-white shadow-xl rotate-6 hover:rotate-0 transition-transform flex flex-col items-center justify-center gap-1.5 mt-4 cursor-pointer"
                    >
                      <FileText className="w-9 h-9" />
                      <span className="text-xs font-extrabold">PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateToHub('text-tools')}
                      className="w-28 h-28 rounded-3xl bg-[#E1F0FF] text-[#1D4ED8] border border-white shadow-xl rotate-3 hover:rotate-0 transition-transform flex flex-col items-center justify-center gap-1.5 -mt-2 cursor-pointer"
                    >
                      <Type className="w-9 h-9" />
                      <span className="text-xs font-extrabold">TEXT</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateToHub('dev-tools')}
                      className="w-28 h-28 rounded-3xl bg-[#FFF1D9] text-[#D97706] border border-white shadow-xl -rotate-3 hover:rotate-0 transition-transform flex flex-col items-center justify-center gap-1.5 mt-2 cursor-pointer"
                    >
                      <Code2 className="w-9 h-9" />
                      <span className="text-xs font-extrabold">DEV &amp; AI</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 5 TOOL CATEGORY HUBS + SEPARATE AI SEARCH SHORTCUT */}
            <section className="max-w-[1200px] mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  {
                    title: 'Text Tools',
                    desc: 'Edit, convert and analyze text.',
                    bg: '#EDE7FF',
                    fg: '#6D28D9',
                    icon: <Type className="w-5 h-5" />,
                    onClick: () => navigateToHub('text-tools'),
                  },
                  {
                    title: 'Image Tools',
                    desc: 'Compress, resize and convert images.',
                    bg: '#E1F0FF',
                    fg: '#1D4ED8',
                    icon: <ImageIcon className="w-5 h-5" />,
                    onClick: () => navigateToHub('image-tools'),
                  },
                  {
                    title: 'PDF Tools',
                    desc: 'Merge, split and manage PDF files.',
                    bg: '#FFE7EC',
                    fg: '#E11D48',
                    icon: <FileText className="w-5 h-5" />,
                    onClick: () => navigateToHub('pdf-tools'),
                  },
                  {
                    title: 'Developer Tools',
                    desc: 'Format, encode and work with code.',
                    bg: '#E0F7F0',
                    fg: '#047857',
                    icon: <Code2 className="w-5 h-5" />,
                    onClick: () => navigateToHub('dev-tools'),
                  },
                  {
                    title: 'Calculators',
                    desc: 'Everyday calculation & generator tools.',
                    bg: '#FFF1D9',
                    fg: '#D97706',
                    icon: <Calculator className="w-5 h-5" />,
                    onClick: () => navigateToHub('generators'),
                  },
                  {
                    title: 'AI Tools',
                    desc: 'Smart grounded search & high thinking.',
                    bg: '#F4E5FF',
                    fg: '#7E22CE',
                    icon: <Sparkles className="w-5 h-5" />,
                    onClick: () => openAiModal(''),
                  },
                ].map((cat) => (
                  <button
                    key={cat.title}
                    type="button"
                    onClick={cat.onClick}
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
                  </button>
                ))}
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
                        <button
                          type="button"
                          onClick={() => navigateToTool(card.toolId)}
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
                        </button>
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
                          <button
                            type="button"
                            onClick={() => navigateToTool(card.toolId)}
                            aria-label={`Open ${card.title}`}
                            className="p-1 text-[#7047EB] cursor-pointer"
                          >
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
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
                            <button
                              type="button"
                              onClick={() => navigateToTool(tool.id)}
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
                            </button>
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
                            <div className="flex flex-wrap gap-1">
                              {tool.lsiKeywords.slice(0, 2).map((kw) => (
                                <span
                                  key={kw}
                                  className="px-2 py-0.5 rounded-md bg-[#F8F7FC] dark:bg-[#252A3F] text-[10px] font-medium text-[#64748B] dark:text-[#94A3B8]"
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => navigateToTool(tool.id)}
                              className="text-xs font-bold text-[#7047EB] flex items-center gap-1 cursor-pointer shrink-0"
                            >
                              <span>Launch</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Recently Used Strip (if user has opened tools) */}
              {recentIds.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#64748B]">
                    <Clock className="w-3.5 h-3.5 text-[#7047EB]" />
                    <span>Recently Used:</span>
                  </span>
                  {recentIds.map((id) => {
                    const tool = getToolById(id);
                    if (!tool) return null;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => navigateToTool(id)}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] text-xs font-semibold text-[#253044] dark:text-[#CBD5E1] hover:border-[#7047EB] hover:text-[#7047EB] transition-colors cursor-pointer"
                      >
                        {tool.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* PRIVACY-FIRST TOOLS BANNER (Matching Reference Screenshot Panel 1) */}
            <section className="max-w-[1200px] mx-auto px-4 sm:px-6">
              <div className="rounded-3xl bg-gradient-to-r from-[#EDE7FF] via-[#F4F1FF] to-[#E1F0FF] dark:from-[#1E1B36] dark:via-[#1C1F2E] dark:to-[#182238] border border-[#DDD6FE] dark:border-[#37306B] p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#252142] text-[#7047EB] flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#171927] dark:text-white">
                      Privacy-First Tools
                    </h2>
                    <p className="text-xs sm:text-sm text-[#253044] dark:text-[#CBD5E1] mt-0.5">
                      Most of our tools run directly in your browser, so your files and data stay on your device.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 text-xs font-semibold text-[#171927] dark:text-[#E2E8F0] shrink-0">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>No unnecessary uploads — files stay on your device</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Faster and more secure in-browser processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Works across all modern desktop and mobile devices</span>
                  </div>
                </div>
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
                      <button
                        type="button"
                        onClick={() => navigateToHub(hub.id)}
                        className="text-xs font-bold text-[#7047EB] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Category</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {hubTools.map((tool) => (
                        <button
                          key={tool.id}
                          type="button"
                          onClick={() => navigateToTool(tool.id)}
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
                          <ArrowRight className="w-4 h-4 text-[#7047EB] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>

            {/* POPULAR WORKFLOWS & QUICK TASKS */}
            <section className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6">
              <div className="rounded-3xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] p-6 sm:p-8 space-y-6 shadow-2xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E8E6F2] dark:border-[#2A2E42] pb-5">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7047EB]">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Quick Task Shortcuts</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#171927] dark:text-white tracking-tight">
                      Popular Workflows &amp; Common Tasks
                    </h2>
                    <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8]">
                      Click any task below to jump straight into the right utility.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {PLATFORM_LSI_CLUSTERS.map((cluster) => {
                    return (
                      <div
                        key={cluster.clusterTitle}
                        className="p-5 rounded-2xl bg-[#F8F7FC] dark:bg-[#171927] border border-[#E8E6F2] dark:border-[#2A2E42] space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-extrabold text-[#171927] dark:text-white flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-[#7047EB] shrink-0" />
                            <span>{cluster.clusterTitle}</span>
                          </h3>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {cluster.keywords.map((kwItem) => {
                            return (
                              <button
                                key={kwItem.term}
                                type="button"
                                onClick={() => navigateToTool(kwItem.toolId || cluster.featuredToolId)}
                                className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] text-xs font-medium text-[#253044] dark:text-[#CBD5E1] hover:border-[#7047EB] hover:text-[#7047EB] transition-colors cursor-pointer"
                              >
                                {kwItem.term}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* HOW IT WORKS SECTION (Matching Reference Screenshot Bottom-Left) */}
            <section id="how-it-works" className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#171927] dark:text-white tracking-tight">
                How It Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    step: '1 Discover',
                    desc: 'Find the right tool for your task using live search, category filters, or Ctrl+K.',
                    icon: <Search className="w-5 h-5 text-[#7047EB]" />,
                  },
                  {
                    step: '2 Use',
                    desc: 'Work immediately inside your browser with a clean, distraction-free interface.',
                    icon: <Zap className="w-5 h-5 text-[#7047EB]" />,
                  },
                  {
                    step: '3 Download',
                    desc: 'Get your results or batch ZIP archive in seconds (no sign-up required).',
                    icon: <Download className="w-5 h-5 text-[#7047EB]" />,
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
            </section>
          </div>
        )}
      </main>

      {/* =====================================================================
          SEMANTIC DARK FOOTER (Matching Reference Screenshot Bottom Bar)
      ===================================================================== */}
      <footer className="bg-[#171927] text-[#CBD5E1] py-12 border-t border-[#2A2E42]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-white font-extrabold text-lg">
              <span className="w-7 h-7 rounded-lg bg-[#7047EB] text-white flex items-center justify-center text-xs">
                NG
              </span>
              <span>NextGenToolkit</span>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Everything you need. Nothing you don't. Free privacy-first browser utilities for PDF, image, text, and developer tasks.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Popular Tools
            </h3>
            <ul className="space-y-2 text-xs text-[#94A3B8]">
              <li>
                <button
                  type="button"
                  onClick={() => navigateToTool('compress-pdf')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Offline PDF Compressor
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToTool('compress-image-to-kb')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Target-KB Image Compressor
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToTool('json-formatter-validator')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  JSON Formatter &amp; Auto-Fixer
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToTool('custom-qr-code-generator')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Vector SVG QR Code Studio
                </button>
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
                  <button
                    type="button"
                    onClick={() => navigateToHub(h.id)}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    {h.name}
                  </button>
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
                <button
                  type="button"
                  onClick={() => navigateToTool('merge-pdf')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  PDF Merger &amp; Organizer
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToTool('bulk-webp-avif-converter')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Bulk WebP Image Converter
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToTool('word-counter-density')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Word Counter &amp; Density
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToTool('password-api-key-generator')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Password &amp; API Key Generator
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Quick Links
            </h3>
            <ul className="space-y-2 text-xs text-[#94A3B8]">
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
                  onClick={() => scrollToHomeSection('popular-workbench')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Pinned Favorites
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openAiModal('')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  AI Search Assistant
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToHomeSection('how-it-works')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  How It Works
                </button>
              </li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Modals */}
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
