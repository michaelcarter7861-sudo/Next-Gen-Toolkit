/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import {
  HUBS,
  TOOLS_CATALOG,
  HubId,
  getToolById,
  getHubById,
  getToolsByHub,
} from './data/toolsCatalog';
import { SchemaHeadInjector } from './components/SchemaHeadInjector';
import { CommandModal, SeoGeoInspectorModal, AiWorkflowModal } from './components/CommandModal';
import { ToolWorkspace } from './components/ToolWorkspace';
import { CategoryHubView } from './components/CategoryHubView';

export default function App() {
  const [activeView, setActiveView] = useState<'home' | 'hub' | 'tool'>('home');
  const [selectedHubId, setSelectedHubId] = useState<HubId>('image-tools');
  const [selectedToolId, setSelectedToolId] = useState<string>('compress-image-to-kb');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Homepage live search query
  const [heroSearch, setHeroSearch] = useState<string>('');

  // Modals
  const [isCommandOpen, setIsCommandOpen] = useState<boolean>(false);
  const [isSeoModalOpen, setIsSeoModalOpen] = useState<boolean>(false);
  const [seoModalTab, setSeoModalTab] = useState<
    'llms' | 'llms-full' | 'robots' | 'sitemap' | 'design-system'
  >('llms');
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [aiModalContext, setAiModalContext] = useState<string>('');

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
      const appPath = basePath !== '/' && publicPath.startsWith(basePath)
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

  const basePath = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
  const toPublicPath = (path: string) => `${basePath}${path.replace(/^\/+/, '')}`;

  const navigateToHome = () => {
    setActiveView('home');
    window.history.pushState({}, '', toPublicPath('/'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      window.history.pushState({}, '', toPublicPath(found.canonicalPath));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openSeoModal = (tab: 'llms' | 'llms-full' | 'robots' | 'sitemap' | 'design-system') => {
    setSeoModalTab(tab);
    setIsSeoModalOpen(true);
  };

  const openAiModal = (ctx = '') => {
    setAiModalContext(ctx);
    setIsAiModalOpen(true);
  };

  const activeTool = activeView === 'tool' ? getToolById(selectedToolId) ?? null : null;
  const activeHub = activeView === 'hub' ? getHubById(selectedHubId) ?? null : null;

  // Filtered tools for homepage live search
  const homeSearchTrimmed = heroSearch.trim().toLowerCase();
  const homeFilteredTools = homeSearchTrimmed
    ? TOOLS_CATALOG.filter(
        (t) =>
          t.name.toLowerCase().includes(homeSearchTrimmed) ||
          t.shortDesc.toLowerCase().includes(homeSearchTrimmed) ||
          t.primaryKeyword.toLowerCase().includes(homeSearchTrimmed) ||
          t.lsiKeywords.some((k) => k.toLowerCase().includes(homeSearchTrimmed))
      )
    : [];

  // 6 Popular Flagship Tools matching Panel 1 of the reference screenshot
  const popularCards = [
    {
      toolId: 'compress-image-to-kb',
      title: 'Image Compressor',
      desc: 'Reduce image file size without losing quality.',
      bg: '#EDE7FF',
      fg: '#7047EB',
      icon: <ImageIcon className="w-5 h-5" />,
    },
    {
      toolId: 'merge-pdf',
      title: 'PDF Merger',
      desc: 'Combine multiple PDF files into one.',
      bg: '#FFE7EC',
      fg: '#E11D48',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      toolId: 'word-counter-density',
      title: 'Word Counter',
      desc: 'Count words, characters and paragraphs.',
      bg: '#E1F0FF',
      fg: '#1D4ED8',
      icon: <Type className="w-5 h-5" />,
    },
    {
      toolId: 'custom-qr-code-generator',
      title: 'QR Code Generator',
      desc: 'Create custom QR codes instantly.',
      bg: '#E0F7F0',
      fg: '#047857',
      icon: <QrCode className="w-5 h-5" />,
    },
    {
      toolId: 'json-formatter-validator',
      title: 'JSON Formatter',
      desc: 'Format, validate and beautify JSON data.',
      bg: '#EDE7FF',
      fg: '#6D28D9',
      icon: <Code2 className="w-5 h-5" />,
    },
    {
      toolId: 'llm-token-counter',
      title: 'Token & Cost Calculator',
      desc: 'Calculate LLM tokens and percentages quickly.',
      bg: '#FFF1D9',
      fg: '#D97706',
      icon: <Percent className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FC] dark:bg-[#131520] text-[#171927] dark:text-[#F8F7FC] transition-colors">
      <SchemaHeadInjector activeTool={activeTool} activeHub={activeHub} />

      {/* =====================================================================
          ZONE 1: Global Header & Quick-Switch Command Bar (3-Zone Top Bar Contract)
      ===================================================================== */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#171927]/90 backdrop-blur-md border-b border-[#E8E6F2] dark:border-[#2A2E42]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Title */}
          <button
            type="button"
            onClick={navigateToHome}
            className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-[#171927] dark:text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span className="w-8 h-8 rounded-xl bg-[#7047EB] text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
              U
            </span>
            <span>UTILIX</span>
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
              onClick={() => openSeoModal('llms')}
              className="hover:text-[#7047EB] dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              SEO & GEO
            </button>
            <button
              type="button"
              onClick={() => openAiModal('')}
              className="hover:text-[#7047EB] dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              AI Search
            </button>
            <button
              type="button"
              onClick={() => openSeoModal('design-system')}
              className="hover:text-[#7047EB] dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Design System
            </button>
          </nav>

          {/* Zone 3: Quick-Switch Search, Theme Toggle & Primary Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsCommandOpen(true)}
              aria-label="Quick search tools (Ctrl+K)"
              className="p-2 rounded-xl text-[#253044] dark:text-[#CBD5E1] hover:bg-[#F8F7FC] dark:hover:bg-[#252A3F] transition-colors cursor-pointer"
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
              className="px-4 py-2 rounded-xl bg-[#7047EB] hover:bg-[#5E35D9] text-white text-xs sm:text-sm font-bold shadow-sm shadow-[#7047EB]/25 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
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
            onOpenSeoModal={openSeoModal}
          />
        ) : activeView === 'hub' && activeHub ? (
          <CategoryHubView
            hub={activeHub}
            onNavigateHome={navigateToHome}
            onSelectTool={navigateToTool}
            onSelectHub={navigateToHub}
          />
        ) : (
          /* MASTER HOMEPAGE MATCHING REFERENCE DESIGN 1:1 */
          <div className="space-y-14 pb-16">
            {/* HERO SECTION */}
            <section className="relative overflow-hidden pt-10 pb-12 sm:pt-14 sm:pb-16 border-b border-[#E8E6F2]/70 dark:border-[#2A2E42]/60 bg-gradient-to-b from-[#F4F0FF]/70 via-[#F8F7FC] to-[#F8F7FC] dark:from-[#1A1830] dark:via-[#131520] dark:to-[#131520]">
              <div className="max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                {/* Left / Center Hero Column */}
                <div className="lg:col-span-7 text-center lg:text-left space-y-5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#7047EB] dark:text-[#A78BFA]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>YOUR DIGITAL TOOLKIT · 25 PRACTICAL UTILITIES</span>
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
                    Practical tools for PDF, image, text and developer tasks. Selected utilities process inputs locally in your browser; supported formats and batch capacity vary by tool and device.
                  </p>

                  {/* Search Bar matching Screenshot Panel 1 */}
                  <div className="max-w-xl mx-auto lg:mx-0 pt-1">
                    <div className="flex items-center bg-white dark:bg-[#1C1F2E] rounded-2xl p-1.5 shadow-lg shadow-[#7047EB]/8 border border-[#E8E6F2] dark:border-[#2A2E42]">
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
                      <div className="mt-2 rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] shadow-xl p-2 max-h-64 overflow-y-auto text-left">
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
                              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#F8F7FC] dark:hover:bg-[#252A3F] text-left"
                            >
                              <div>
                                <div className="text-xs font-bold text-[#171927] dark:text-white">
                                  {t.name}
                                </div>
                                <div className="text-xs text-[#64748B]">{t.shortDesc}</div>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-[#7047EB]" />
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
                      <span className="text-xs font-extrabold">DEV & AI</span>
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

            {/* POPULAR TOOLS SECTION (Matching Reference Screenshot Panel 1) */}
            <section className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#171927] dark:text-white tracking-tight">
                  Popular Tools
                </h2>
                <button
                  type="button"
                  onClick={() => setIsCommandOpen(true)}
                  className="text-xs sm:text-sm font-bold text-[#7047EB] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View All 25 Tools</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {popularCards.map((card) => (
                  <button
                    key={card.toolId}
                    type="button"
                    onClick={() => navigateToTool(card.toolId)}
                    className="group p-5 rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] hover:border-[#7047EB] transition-all text-left flex items-center justify-between gap-4 shadow-2xs hover:shadow-md cursor-pointer"
                  >
                    <div className="flex items-start gap-4 min-w-0">
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
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#7047EB] shrink-0 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
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
                    <span>No unnecessary uploads for supported browser-based tasks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Browser-based processing for supported tasks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Works across modern browsers; capacity depends on your device</span>
                  </div>
                </div>
              </div>
            </section>

            {/* COMPLETE 25-TOOL DIRECTORY ORGANIZED ACROSS THE 5 TOPICAL HUBS */}
            <section className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-10">
              <div className="border-b border-[#E8E6F2] dark:border-[#2A2E42] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#171927] dark:text-white tracking-tight">
                    Complete 25-Tool Platform Directory
                  </h2>
                  <p className="text-sm text-[#64748B] mt-0.5">
                    Organized across five tool categories, with AI Search as a separate feature.
                  </p>
                </div>
                <span className="text-xs font-mono text-[#7047EB] font-semibold">
                  25 Browser-Based Utilities · 5 Tool Categories + AI Search
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
                        <span className="text-xs font-mono text-[#64748B]">{hub.slug}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigateToHub(hub.id)}
                        className="text-xs font-bold text-[#7047EB] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Hub ({hubTools.length})</span>
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
                            <div className="text-sm font-bold text-[#171927] dark:text-white group-hover:text-[#7047EB] transition-colors truncate">
                              {tool.name}
                            </div>
                            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] line-clamp-1 mt-0.5">
                              {tool.shortDesc}
                            </p>
                            <div className="text-[11px] font-mono text-[#64748B]/80 mt-1.5 truncate">
                              {tool.canonicalPath}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#7047EB] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>

            {/* HOW IT WORKS SECTION (Matching Reference Screenshot Bottom-Left) */}
            <section className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#171927] dark:text-white tracking-tight">
                How It Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    step: '1 Discover',
                    desc: 'Find the right tool for your task using live search or Ctrl+K.',
                    icon: <Search className="w-5 h-5 text-[#7047EB]" />,
                  },
                  {
                    step: '2 Use',
                    desc: 'Work immediately inside your browser RAM with a simple, clean interface.',
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
                U
              </span>
              <span>UTILIX</span>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Free browser-based utilities for PDF, image, text, developer and everyday tasks.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Flagship Tools
            </h3>
            <ul className="space-y-2 text-xs text-[#94A3B8]">
              <li>
                <button
                  type="button"
                  onClick={() => navigateToTool('compress-pdf')}
                  className="hover:text-white transition-colors"
                >
                  Offline PDF Compressor
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToTool('compress-image-to-kb')}
                  className="hover:text-white transition-colors"
                >
                  Target-KB Image Compressor
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToTool('json-formatter-validator')}
                  className="hover:text-white transition-colors"
                >
                  JSON Formatter & Auto-Fixer
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToTool('custom-qr-code-generator')}
                  className="hover:text-white transition-colors"
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
                    className="hover:text-white transition-colors"
                  >
                    {h.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              GEO & Crawler Files
            </h3>
            <ul className="space-y-2 text-xs font-mono text-[#94A3B8]">
              <li>
                <button
                  type="button"
                  onClick={() => openSeoModal('llms')}
                  className="hover:text-white transition-colors"
                >
                  /llms.txt
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openSeoModal('llms-full')}
                  className="hover:text-white transition-colors"
                >
                  /llms-full.txt
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openSeoModal('robots')}
                  className="hover:text-white transition-colors"
                >
                  /robots.txt
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openSeoModal('sitemap')}
                  className="hover:text-white transition-colors"
                >
                  /sitemap.xml
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Architecture & AI
            </h3>
            <ul className="space-y-2 text-xs text-[#94A3B8]">
              <li>
                <button
                  type="button"
                  onClick={() => openSeoModal('design-system')}
                  className="hover:text-white transition-colors"
                >
                  Extracted UI Design System
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openAiModal('')}
                  className="hover:text-white transition-colors"
                >
                  Google Search Grounding Studio
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openAiModal('')}
                  className="hover:text-white transition-colors"
                >
                  High-Thinking (Carbon) Engine
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
      />
      <SeoGeoInspectorModal
        isOpen={isSeoModalOpen}
        onClose={() => setIsSeoModalOpen(false)}
        initialTab={seoModalTab}
      />
      <AiWorkflowModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        initialContext={aiModalContext}
      />
    </div>
  );
}
