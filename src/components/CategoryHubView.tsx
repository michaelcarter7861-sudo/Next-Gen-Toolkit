import React, { useState } from 'react';
import {
  Search,
  ArrowRight,
  ChevronRight,
  Image as ImageIcon,
  FileText,
  Code2,
  Type,
  Calculator,
  ShieldCheck,
  Star,
  Tag,
} from 'lucide-react';
import { HubDefinition, ToolDefinition, getToolsByHub, HubId, HUBS } from '../data/toolsCatalog';

interface CategoryHubViewProps {
  hub: HubDefinition;
  onNavigateHome: () => void;
  onSelectTool: (toolId: string) => void;
  onSelectHub: (hubId: HubId) => void;
  favoriteIds?: string[];
  onToggleFavorite?: (toolId: string) => void;
}

export function CategoryHubView({
  hub,
  onNavigateHome,
  onSelectTool,
  onSelectHub,
  favoriteIds = [],
  onToggleFavorite,
}: CategoryHubViewProps) {
  const [activeFilter, setActiveFilter] = useState<string>('All Tools');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allHubTools = getToolsByHub(hub.id);
  const filteredTools = allHubTools.filter((tool) => {
    const matchesSub =
      activeFilter === 'All Tools' ||
      tool.subCategory.toLowerCase() === activeFilter.toLowerCase();
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      tool.name.toLowerCase().includes(q) ||
      tool.shortDesc.toLowerCase().includes(q) ||
      tool.primaryKeyword.toLowerCase().includes(q) ||
      tool.lsiKeywords.some((k) => k.toLowerCase().includes(q)) ||
      tool.clusteredQueries.some((cq) => cq.toLowerCase().includes(q));
    return matchesSub && matchesSearch;
  });

  const renderHubIcon = (iconName: HubDefinition['iconName'], sizeClass = 'w-7 h-7') => {
    switch (iconName) {
      case 'Image':
        return <ImageIcon className={sizeClass} />;
      case 'FileText':
        return <FileText className={sizeClass} />;
      case 'Code2':
        return <Code2 className={sizeClass} />;
      case 'Type':
        return <Type className={sizeClass} />;
      default:
        return <Calculator className={sizeClass} />;
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#64748B]">
        <button
          type="button"
          onClick={onNavigateHome}
          className="hover:text-[#7047EB] transition-colors font-medium cursor-pointer"
        >
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>Tools</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#171927] dark:text-[#F8F7FC] font-semibold">{hub.name}</span>
      </nav>

      {/* Hub Hero Banner */}
      <div
        className="rounded-3xl p-6 sm:p-8 border border-[#E8E6F2] dark:border-[#2A2E42] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, rgba(225, 240, 255, 0.55) 0%, rgba(237, 231, 255, 0.65) 100%)',
        }}
      >
        <div className="flex items-start sm:items-center gap-5 z-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-xs bg-white dark:bg-[#1C1F2E]"
            style={{ color: hub.accentFg }}
          >
            {renderHubIcon(hub.iconName, 'w-8 h-8')}
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171927] dark:text-[#171927] tracking-tight">
              {hub.name}
            </h1>
            <p className="text-sm text-[#253044] max-w-xl">{hub.description}</p>
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {hub.hubLsiKeywords.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => setSearchQuery(kw.split(' ')[0])}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/85 text-[11px] font-medium text-[#253044] hover:text-[#7047EB] border border-white transition-colors cursor-pointer"
                >
                  <Tag className="w-2.5 h-2.5 text-[#7047EB]" />
                  <span>{kw}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="z-10 flex items-center gap-2 text-xs font-semibold text-[#7047EB] bg-white/95 px-4 py-2.5 rounded-xl shadow-xs shrink-0">
          <ShieldCheck className="w-4 h-4" />
          <span>NextGenToolkit · {allHubTools.length} Utilities</span>
        </div>
      </div>

      {/* Filter Bar & Search Box */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {hub.subFilters.map((filterLabel) => {
            const isActive = activeFilter === filterLabel;
            const displayLabel =
              filterLabel === 'All Tools'
                ? `All Tools (${allHubTools.length})`
                : filterLabel;
            return (
              <button
                key={filterLabel}
                type="button"
                onClick={() => setActiveFilter(filterLabel)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#7047EB] text-white shadow-sm shadow-[#7047EB]/25'
                    : 'bg-white dark:bg-[#1C1F2E] text-[#253044] dark:text-[#CBD5E1] border border-[#E8E6F2] dark:border-[#2A2E42] hover:border-[#7047EB]'
                }`}
              >
                {displayLabel}
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${hub.name.toLowerCase()}...`}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] text-xs text-[#171927] dark:text-[#F8F7FC] placeholder-[#64748B] focus:outline-none focus:border-[#7047EB]"
          />
        </div>
      </div>

      {/* 3-Column Tool Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTools.map((tool: ToolDefinition) => {
          const isFav = favoriteIds.includes(tool.id);
          return (
            <div
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className="group p-5 rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] hover:border-[#7047EB] transition-all text-left flex flex-col justify-between gap-4 cursor-pointer shadow-2xs hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: hub.accentBg, color: hub.accentFg }}
                  >
                    {renderHubIcon(hub.iconName, 'w-5 h-5')}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-[#171927] dark:text-[#F8F7FC] group-hover:text-[#7047EB] transition-colors truncate">
                      {tool.name}
                    </h2>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] line-clamp-2 mt-1 leading-relaxed">
                      {tool.shortDesc}
                    </p>
                  </div>
                </div>

                {onToggleFavorite && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(tool.id);
                    }}
                    aria-label={isFav ? `Unpin ${tool.name}` : `Pin ${tool.name}`}
                    className="p-1.5 rounded-lg text-[#94A3B8] hover:text-amber-500 hover:bg-[#F8F7FC] dark:hover:bg-[#252A3F] transition-colors shrink-0"
                  >
                    <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                )}
              </div>

              <div className="pt-3 border-t border-[#E8E6F2]/70 dark:border-[#2A2E42]/70 flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1 overflow-hidden max-h-5">
                  {tool.lsiKeywords.slice(0, 2).map((kw) => (
                    <span
                      key={kw}
                      className="px-2 py-0.5 rounded-md bg-[#F8F7FC] dark:bg-[#151824] text-[10px] font-medium text-[#64748B] truncate max-w-[130px]"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
                <ArrowRight className="w-4 h-4 text-[#7047EB] shrink-0 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Other Topical Hubs Switcher */}
      <div className="pt-6 border-t border-[#E8E6F2] dark:border-[#2A2E42]">
        <h3 className="text-sm font-bold text-[#171927] dark:text-[#F8F7FC] mb-3">
          Switch to Another NextGenToolkit Category Hub
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {HUBS.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => {
                setActiveFilter('All Tools');
                setSearchQuery('');
                onSelectHub(h.id);
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                h.id === hub.id
                  ? 'border-[#7047EB] bg-[#EDE7FF]/40 dark:bg-[#7047EB]/20'
                  : 'border-[#E8E6F2] dark:border-[#2A2E42] bg-white dark:bg-[#1C1F2E] hover:border-[#7047EB]'
              }`}
            >
              <div className="text-xs font-bold text-[#171927] dark:text-[#F8F7FC]">{h.name}</div>
              <div className="text-xs text-[#64748B] mt-0.5">{getToolsByHub(h.id).length} Utilities</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
