import React, { useState } from 'react';
import {
  Search,
  ArrowRight,
  ChevronDown,
  Image as ImageIcon,
  FileText,
  Code2,
  Type,
  Calculator,
  ShieldCheck,
  Star,
  ExternalLink,
  Link2,
  BookOpen,
} from 'lucide-react';
import { HubDefinition, ToolDefinition, getToolsByHub, HubId, HUBS } from '../data/toolsCatalog';
import { HUB_FAQS, HUB_EDITORIAL_LINKS } from '../data/seoSchemaData';
import { BreadcrumbsNav } from './BreadcrumbsNav';
import { RichSeoText } from './RichSeoText';

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

  const basePath = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const resolveHref = (path: string) => `${basePath}${path.replace(/^\/+/, '')}`;

  const allHubTools = getToolsByHub(hub.id);
  const editorialPack = HUB_EDITORIAL_LINKS[hub.id];

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
        return <ImageIcon className={sizeClass} aria-hidden="true" />;
      case 'FileText':
        return <FileText className={sizeClass} aria-hidden="true" />;
      case 'Code2':
        return <Code2 className={sizeClass} aria-hidden="true" />;
      case 'Type':
        return <Type className={sizeClass} aria-hidden="true" />;
      default:
        return <Calculator className={sizeClass} aria-hidden="true" />;
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Semantic Breadcrumb Trail */}
      <BreadcrumbsNav
        items={[
          { label: 'Home', href: '/', onClick: onNavigateHome },
          { label: hub.name, href: hub.slug, current: true },
        ]}
      />

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
            {editorialPack && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs text-[#253044]">
                {editorialPack.internalLinks[0] && (
                  <span>
                    Featured utility:{' '}
                    <a
                      href={resolveHref(editorialPack.internalLinks[0].href)}
                      onClick={(e) => {
                        if (editorialPack.internalLinks[0].toolId) {
                          e.preventDefault();
                          onSelectTool(editorialPack.internalLinks[0].toolId);
                        }
                      }}
                      className="font-bold text-[#7047EB] underline decoration-[#7047EB]/40 hover:decoration-[#7047EB] underline-offset-2"
                    >
                      {editorialPack.internalLinks[0].keywordAnchor}
                    </a>
                  </span>
                )}
                {editorialPack.externalLinks[0] && (
                  <>
                    <span className="text-[#94A3B8]">·</span>
                    <span>
                      Standard:{' '}
                      <a
                        href={editorialPack.externalLinks[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 font-bold text-[#7047EB] underline decoration-[#7047EB]/40 hover:decoration-[#7047EB] underline-offset-2"
                      >
                        <span>{editorialPack.externalLinks[0].keywordAnchor}</span>
                        <ExternalLink className="w-3 h-3 inline shrink-0" aria-hidden="true" />
                      </a>
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="z-10 flex items-center gap-2 text-xs font-semibold text-[#7047EB] bg-white/95 px-4 py-2.5 rounded-xl shadow-xs shrink-0">
          <ShieldCheck className="w-4 h-4" aria-hidden="true" />
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
          <Search
            className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
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
          const href = resolveHref(tool.canonicalPath);
          return (
            <div
              key={tool.id}
              className="group p-5 rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] hover:border-[#7047EB] transition-all text-left flex flex-col justify-between gap-4 shadow-2xs hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <a
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTool(tool.id);
                  }}
                  className="flex items-start gap-3.5 min-w-0 flex-1 cursor-pointer"
                >
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
                </a>

                {onToggleFavorite && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(tool.id);
                    }}
                    aria-label={isFav ? `Unpin ${tool.name}` : `Pin ${tool.name}`}
                    className="p-1.5 rounded-lg text-[#94A3B8] hover:text-amber-500 hover:bg-[#F8F7FC] dark:hover:bg-[#252A3F] transition-colors shrink-0 cursor-pointer"
                  >
                    <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                )}
              </div>

              <a
                href={href}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectTool(tool.id);
                }}
                className="pt-3 border-t border-[#E8E6F2]/70 dark:border-[#2A2E42]/70 flex items-center justify-between gap-2 cursor-pointer"
              >
                <div className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] truncate">
                  {tool.subCategory} · <span className="font-mono">{tool.specTable.supportedFormats}</span>
                </div>
                <ArrowRight
                  className="w-4 h-4 text-[#7047EB] shrink-0 group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                />
              </a>
            </div>
          );
        })}
      </div>

      {/* Category Editorial Guide: Contextual Workflows + Technical Standards */}
      {editorialPack && (
        <section className="rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] p-6 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-[#171927] dark:text-[#F8F7FC]">
              Connected Workflows &amp; Technical Standards for {hub.name}
            </h2>
            <p className="text-xs text-[#64748B]">
              {editorialPack.editorialSummary}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm text-[#253044] dark:text-[#CBD5E1] leading-relaxed">
            <div className="p-5 rounded-2xl bg-[#F8F7FC] dark:bg-[#171927] border border-[#E8E6F2] dark:border-[#2A2E42] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7047EB]">
                <Link2 className="w-4 h-4" aria-hidden="true" />
                <span>Common {hub.name} Workflows</span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed">
                With NextGenToolkit {hub.name}, you can{' '}
                {editorialPack.internalLinks.map((item, idx) => (
                  <React.Fragment key={item.href}>
                    <a
                      href={resolveHref(item.href)}
                      onClick={(e) => {
                        if (item.toolId) {
                          e.preventDefault();
                          onSelectTool(item.toolId);
                        }
                      }}
                      className="font-semibold text-[#7047EB] dark:text-[#A78BFA] underline decoration-[#7047EB]/40 hover:decoration-[#7047EB] underline-offset-2"
                    >
                      {item.keywordAnchor}
                    </a>{' '}
                    {item.contextAfter}
                    {idx < editorialPack.internalLinks.length - 1 ? ' ' : ''}
                  </React.Fragment>
                ))}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F8F7FC] dark:bg-[#171927] border border-[#E8E6F2] dark:border-[#2A2E42] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7047EB]">
                <BookOpen className="w-4 h-4" aria-hidden="true" />
                <span>Technical Methodology &amp; Open Standards</span>
              </div>
              <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed">
                {editorialPack.externalLinks.map((ext) => {
                  const parts = ext.contextSentence.split(ext.keywordAnchor);
                  return (
                    <p key={ext.url}>
                      {parts.length === 2 ? (
                        <>
                          {parts[0]}
                          <a
                            href={ext.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 font-semibold text-[#7047EB] dark:text-[#A78BFA] underline decoration-[#7047EB]/40 hover:decoration-[#7047EB] underline-offset-2"
                          >
                            <span>{ext.keywordAnchor}</span>
                            <ExternalLink className="w-3 h-3 inline shrink-0" aria-hidden="true" />
                          </a>
                          {parts[1]}{' '}
                          <span className="text-[11px] font-medium text-[#64748B]">
                            ({ext.sourceName})
                          </span>
                        </>
                      ) : (
                        <>
                          {ext.contextSentence}{' '}
                          <a
                            href={ext.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 font-semibold text-[#7047EB] dark:text-[#A78BFA] underline decoration-[#7047EB]/40 hover:decoration-[#7047EB] underline-offset-2"
                          >
                            <span>{ext.keywordAnchor}</span>
                            <ExternalLink className="w-3 h-3 inline shrink-0" aria-hidden="true" />
                          </a>{' '}
                          <span className="text-[11px] font-medium text-[#64748B]">
                            ({ext.sourceName})
                          </span>
                        </>
                      )}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Hub Frequently Asked Questions (With Inline Internal + Authority Links) */}
      <section
        itemScope
        itemType="https://schema.org/FAQPage"
        className="rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] p-6 space-y-4"
      >
        <div>
          <h2 className="text-lg font-bold text-[#171927] dark:text-[#F8F7FC]">
            Frequently Asked Questions About {hub.name}
          </h2>
          <p className="text-xs text-[#64748B]">
            Answers to common technical, privacy, and workflow questions about NextGenToolkit {hub.name}.
          </p>
        </div>

        <div className="divide-y divide-[#E8E6F2] dark:divide-[#2A2E42]">
          {(HUB_FAQS[hub.id] || []).map((faq, idx) => (
            <details
              key={idx}
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
              className="group py-3.5"
              open={idx === 0}
            >
              <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-semibold text-[#171927] dark:text-[#F8F7FC] hover:text-[#7047EB]">
                <span itemProp="name">{faq.q}</span>
                <ChevronDown
                  className="w-4 h-4 text-[#64748B] group-open:rotate-180 transition-transform shrink-0 ml-2"
                  aria-hidden="true"
                />
              </summary>
              <div
                itemScope
                itemProp="acceptedAnswer"
                itemType="https://schema.org/Answer"
                className="mt-2 text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed"
              >
                <p itemProp="text">
                  <RichSeoText
                    text={faq.a}
                    onSelectTool={onSelectTool}
                    onSelectHub={onSelectHub}
                  />
                </p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Other Topical Hubs Switcher (Crawlable Links) */}
      <div className="pt-6 border-t border-[#E8E6F2] dark:border-[#2A2E42]">
        <h3 className="text-sm font-bold text-[#171927] dark:text-[#F8F7FC] mb-3">
          Explore Other NextGenToolkit Categories
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {HUBS.map((h) => (
            <a
              key={h.id}
              href={resolveHref(h.slug)}
              onClick={(e) => {
                e.preventDefault();
                setActiveFilter('All Tools');
                setSearchQuery('');
                onSelectHub(h.id);
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer block ${
                h.id === hub.id
                  ? 'border-[#7047EB] bg-[#EDE7FF]/40 dark:bg-[#7047EB]/20'
                  : 'border-[#E8E6F2] dark:border-[#2A2E42] bg-white dark:bg-[#1C1F2E] hover:border-[#7047EB]'
              }`}
            >
              <div className="text-xs font-bold text-[#171927] dark:text-[#F8F7FC]">{h.name}</div>
              <div className="text-xs text-[#64748B] mt-0.5">{getToolsByHub(h.id).length} Utilities</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
