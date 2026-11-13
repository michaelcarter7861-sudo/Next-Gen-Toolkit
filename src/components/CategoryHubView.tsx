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
} from 'lucide-react';
import { HubDefinition, ToolDefinition, getToolsByHub, HubId, HUBS } from '../data/toolsCatalog';

interface CategoryHubViewProps {
  hub: HubDefinition;
  onNavigateHome: () => void;
  onSelectTool: (toolId: string) => void;
  onSelectHub: (hubId: HubId) => void;
}

export function CategoryHubView({
  hub,
  onNavigateHome,
  onSelectTool,
  onSelectHub,
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
      tool.primaryKeyword.toLowerCase().includes(q);
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
      {/* Breadcrumb matching Panel 2 of Reference Screenshot */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#64748B]">
        <button
          type="button"
          onClick={onNavigateHome}
          className="hover:text-[#7047EB] transition-colors font-medium"
        >
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>Tools</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#171927] dark:text-[#F8F7FC] font-semibold">{hub.name}</span>
      </nav>

      {/* Hub Hero Banner matching Panel 2 of Reference Screenshot */}
      <div
        className="rounded-3xl p-6 sm:p-8 border border-[#E8E6F2] dark:border-[#2A2E42] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, rgba(225, 240, 255, 0.55) 0%, rgba(237, 231, 255, 0.65) 100%)',
        }}
      >
        <div className="flex items-center gap-5 z-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-xs bg-white dark:bg-[#1C1F2E]"
            style={{ color: hub.accentFg }}
          >
            {renderHubIcon(hub.iconName, 'w-8 h-8')}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171927] dark:text-[#171927] tracking-tight">
              {hub.name}
            </h1>
            <p className="text-sm text-[#253044] mt-1 max-w-xl">{hub.description}</p>
          </div>
        </div>

        <div className="z-10 flex items-center gap-2 text-xs font-semibold text-[#7047EB] bg-white/90 px-4 py-2 rounded-xl shadow-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>100% Client-Side Hub · {allHubTools.length} Utilities</span>
        </div>
      </div>

      {/* Filter Bar & Search Box matching Panel 2 of Reference Screenshot */}
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

      {/* 3-Column Tool Cards Grid matching Panel 2 of Reference Screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTools.map((tool: ToolDefinition) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => onSelectTool(tool.id)}
            className="group p-5 rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] hover:border-[#7047EB] transition-all text-left flex items-center justify-between gap-4 cursor-pointer shadow-2xs hover:shadow-md"
          >
            <div className="flex items-start gap-4 min-w-0">
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
            <ArrowRight className="w-4 h-4 text-[#7047EB] shrink-0 group-hover:translate-x-1 transition-transform" />
          </button>
        ))}
      </div>

      {/* Other Topical Hubs Switcher */}
      <div className="pt-6 border-t border-[#E8E6F2] dark:border-[#2A2E42]">
        <h3 className="text-sm font-bold text-[#171927] dark:text-[#F8F7FC] mb-3">
          Switch to Another Utilix Category Hub
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {HUBS.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => {
                setActiveFilter('All Tools');
                onSelectHub(h.id);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                h.id === hub.id
                  ? 'border-[#7047EB] bg-[#EDE7FF]/40 dark:bg-[#7047EB]/20'
                  : 'border-[#E8E6F2] dark:border-[#2A2E42] bg-white dark:bg-[#1C1F2E] hover:border-[#7047EB]'
              }`}
            >
              <div className="text-xs font-bold text-[#171927] dark:text-[#F8F7FC]">{h.name}</div>
              <div className="text-xs font-mono text-[#64748B] mt-0.5">{h.slug}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
