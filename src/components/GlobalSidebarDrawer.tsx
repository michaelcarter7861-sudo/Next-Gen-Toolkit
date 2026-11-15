import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Home,
  LayoutGrid,
  Sparkles,
  HelpCircle,
  Star,
  ChevronDown,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Code2,
  Type,
  Calculator,
} from 'lucide-react';
import {
  HUBS,
  HubId,
  getToolById,
  getToolsByHub,
} from '../data/toolsCatalog';

interface GlobalSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: 'home' | 'hub' | 'tool' | 'sitemap';
  activeHubId?: HubId | null;
  activeToolId?: string | null;
  onNavigateHome: () => void;
  onNavigateSitemap: () => void;
  onSelectHub: (hubId: HubId) => void;
  onSelectTool: (toolId: string) => void;
  onScrollToSection: (sectionId: string) => void;
  onOpenAiModal: () => void;
  favoriteIds: string[];
  recentIds: string[];
  onToggleFavorite: (toolId: string) => void;
}

export function GlobalSidebarDrawer({
  isOpen,
  onClose,
  activeView,
  activeHubId,
  activeToolId,
  onNavigateHome,
  onNavigateSitemap,
  onSelectHub,
  onSelectTool,
  onScrollToSection,
  onOpenAiModal,
  favoriteIds,
}: GlobalSidebarDrawerProps) {
  const [filterQuery, setFilterQuery] = useState('');
  const [expandedHubs, setExpandedHubs] = useState<Record<string, boolean>>({
    'pdf-tools': true,
    'image-tools': true,
    'dev-tools': true,
    'text-tools': true,
    generators: true,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const basePath = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const resolveHref = (path: string) => `${basePath}${path.replace(/^\/+/, '')}`;

  const toggleHubExpand = (hubId: string) => {
    setExpandedHubs((prev) => ({ ...prev, [hubId]: !prev[hubId] }));
  };

  const renderHubIcon = (hubId: HubId) => {
    switch (hubId) {
      case 'pdf-tools':
        return <FileText className="w-4 h-4" aria-hidden="true" />;
      case 'image-tools':
        return <ImageIcon className="w-4 h-4" aria-hidden="true" />;
      case 'dev-tools':
        return <Code2 className="w-4 h-4" aria-hidden="true" />;
      case 'text-tools':
        return <Type className="w-4 h-4" aria-hidden="true" />;
      default:
        return <Calculator className="w-4 h-4" aria-hidden="true" />;
    }
  };

  const q = filterQuery.trim().toLowerCase();

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label="All Tools and Pages Menu"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#131520]/60 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-Over Sidebar Panel */}
      <aside className="relative z-10 w-full max-w-[300px] sm:max-w-[320px] bg-white dark:bg-[#171927] border-r border-[#E8E6F2] dark:border-[#2A2E42] h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Sidebar Header */}
        <div className="px-4 py-3.5 border-b border-[#E8E6F2] dark:border-[#2A2E42] flex items-center justify-between gap-3 bg-[#F8F7FC] dark:bg-[#131520]">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7047EB] to-[#5E35D9] text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
              NG
            </span>
            <span className="text-sm font-extrabold text-[#171927] dark:text-white">
              NextGenToolkit
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#171927] dark:hover:text-white hover:bg-white dark:hover:bg-[#1C1F2E] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Instant Filter Input */}
        <div className="p-3 border-b border-[#E8E6F2] dark:border-[#2A2E42]">
          <div className="relative">
            <Search
              className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search tools..."
              className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-[#F8F7FC] dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] text-xs text-[#171927] dark:text-white placeholder-[#64748B] focus:outline-none focus:border-[#7047EB]"
            />
            {filterQuery && (
              <button
                type="button"
                onClick={() => setFilterQuery('')}
                aria-label="Clear filter"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[#64748B] hover:text-[#171927] dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Navigation Body (Clean Names Only) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Quick Pages */}
          {!q && (
            <nav aria-label="Main Pages" className="space-y-0.5">
              <a
                href={resolveHref('/')}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateHome();
                  onClose();
                }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  activeView === 'home'
                    ? 'bg-[#EDE7FF] dark:bg-[#7047EB]/25 text-[#7047EB] dark:text-[#C4B5FD]'
                    : 'text-[#253044] dark:text-[#CBD5E1] hover:bg-[#F8F7FC] dark:hover:bg-[#1C1F2E]'
                }`}
              >
                <Home className="w-4 h-4 text-[#7047EB]" aria-hidden="true" />
                <span>Home</span>
              </a>

              <a
                href={resolveHref('/sitemap/')}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateSitemap();
                  onClose();
                }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  activeView === 'sitemap'
                    ? 'bg-[#EDE7FF] dark:bg-[#7047EB]/25 text-[#7047EB] dark:text-[#C4B5FD]'
                    : 'text-[#253044] dark:text-[#CBD5E1] hover:bg-[#F8F7FC] dark:hover:bg-[#1C1F2E]'
                }`}
              >
                <LayoutGrid className="w-4 h-4 text-[#7047EB]" aria-hidden="true" />
                <span>All Tools Directory</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAiModal();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#253044] dark:text-[#CBD5E1] hover:bg-[#F8F7FC] dark:hover:bg-[#1C1F2E] transition-colors cursor-pointer text-left"
              >
                <Sparkles className="w-4 h-4 text-[#7047EB]" aria-hidden="true" />
                <span>AI Search Assistant</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onScrollToSection('platform-faq');
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#253044] dark:text-[#CBD5E1] hover:bg-[#F8F7FC] dark:hover:bg-[#1C1F2E] transition-colors cursor-pointer text-left"
              >
                <HelpCircle className="w-4 h-4 text-[#7047EB]" aria-hidden="true" />
                <span>Help &amp; FAQ</span>
              </button>
            </nav>
          )}

          {/* Pinned Tools (Names Only) */}
          {!q && favoriteIds.length > 0 && (
            <div className="space-y-1">
              <div className="px-2.5 flex items-center gap-1.5 text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                <Star className="w-3 h-3 text-amber-500 fill-amber-400" aria-hidden="true" />
                <span>Pinned Tools</span>
              </div>
              <ul className="space-y-0.5">
                {favoriteIds.map((favId) => {
                  const t = getToolById(favId);
                  if (!t) return null;
                  const isCurrent = activeView === 'tool' && activeToolId === t.id;
                  return (
                    <li key={t.id}>
                      <a
                        href={resolveHref(t.canonicalPath)}
                        onClick={(e) => {
                          e.preventDefault();
                          onSelectTool(t.id);
                          onClose();
                        }}
                        className={`block px-3 py-1.5 rounded-lg text-xs truncate transition-colors ${
                          isCurrent
                            ? 'bg-[#7047EB] text-white font-bold'
                            : 'text-[#253044] dark:text-[#CBD5E1] hover:bg-[#F8F7FC] dark:hover:bg-[#1C1F2E] font-medium'
                        }`}
                      >
                        {t.name}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* All 5 Categories & 25 Tools (Clean Single-Line Names Only) */}
          <div className="space-y-2">
            {HUBS.map((hub) => {
              const hubTools = getToolsByHub(hub.id).filter((tool) => {
                if (!q) return true;
                return (
                  tool.name.toLowerCase().includes(q) ||
                  hub.name.toLowerCase().includes(q)
                );
              });

              if (q && hubTools.length === 0) return null;

              const isExpanded = q ? true : !!expandedHubs[hub.id];
              const isHubActive = activeView === 'hub' && activeHubId === hub.id;

              return (
                <div
                  key={hub.id}
                  className="rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] bg-[#F8F7FC]/40 dark:bg-[#1C1F2E]/40 overflow-hidden"
                >
                  {/* Category Header */}
                  <div
                    className={`flex items-center justify-between px-2.5 py-2 ${
                      isHubActive
                        ? 'bg-[#EDE7FF] dark:bg-[#7047EB]/25'
                        : 'bg-white dark:bg-[#1C1F2E]'
                    }`}
                  >
                    <a
                      href={resolveHref(hub.slug)}
                      onClick={(e) => {
                        e.preventDefault();
                        onSelectHub(hub.id);
                        onClose();
                      }}
                      className="flex items-center gap-2 text-xs font-bold text-[#171927] dark:text-white hover:text-[#7047EB] dark:hover:text-[#A78BFA] transition-colors min-w-0 flex-1"
                    >
                      <span
                        className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                        style={{ backgroundColor: hub.accentBg, color: hub.accentFg }}
                      >
                        {renderHubIcon(hub.id)}
                      </span>
                      <span className="truncate">{hub.name}</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => toggleHubExpand(hub.id)}
                      aria-label={isExpanded ? `Collapse ${hub.name}` : `Expand ${hub.name}`}
                      className="p-1 rounded-md text-[#64748B] hover:text-[#171927] dark:hover:text-white cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Clean Single-Line Tool Names Only */}
                  {isExpanded && (
                    <ul className="p-1.5 space-y-0.5">
                      {hubTools.map((tool) => {
                        const isToolActive = activeView === 'tool' && activeToolId === tool.id;
                        return (
                          <li key={tool.id}>
                            <a
                              href={resolveHref(tool.canonicalPath)}
                              onClick={(e) => {
                                e.preventDefault();
                                onSelectTool(tool.id);
                                onClose();
                              }}
                              className={`block px-3 py-1.5 rounded-lg text-xs truncate transition-colors ${
                                isToolActive
                                  ? 'bg-[#7047EB] text-white font-bold'
                                  : 'text-[#253044] dark:text-[#CBD5E1] hover:bg-white dark:hover:bg-[#252A3F] hover:text-[#7047EB] font-medium'
                              }`}
                            >
                              {tool.name}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
}
