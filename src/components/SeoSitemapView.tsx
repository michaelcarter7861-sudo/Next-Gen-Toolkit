import React from 'react';
import {
  LayoutGrid,
  ArrowRight,
  ShieldCheck,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { HUBS, TOOLS_CATALOG, HubId, getToolsByHub } from '../data/toolsCatalog';
import { BreadcrumbsNav } from './BreadcrumbsNav';

interface SeoSitemapViewProps {
  onNavigateHome: () => void;
  onSelectHub: (hubId: HubId) => void;
  onSelectTool: (toolId: string) => void;
}

export function SeoSitemapView({
  onNavigateHome,
  onSelectHub,
  onSelectTool,
}: SeoSitemapViewProps) {
  const basePath = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const resolveHref = (path: string) => `${basePath}${path.replace(/^\/+/, '')}`;

  const totalPages = 1 + HUBS.length + TOOLS_CATALOG.length;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Semantic Breadcrumb Trail */}
      <BreadcrumbsNav
        items={[
          { label: 'Home', href: '/', onClick: onNavigateHome },
          { label: 'All Tools Directory', href: '/sitemap/', current: true },
        ]}
      />

      {/* Directory Hero Header */}
      <div className="rounded-3xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xs">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7047EB]">
            <LayoutGrid className="w-4 h-4" aria-hidden="true" />
            <span>Complete Platform Directory · {totalPages} Pages</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171927] dark:text-white tracking-tight">
            NextGenToolkit All Tools &amp; Categories Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            Browse all {TOOLS_CATALOG.length} browser utilities and {HUBS.length} category hubs in one place. Every tool runs 100% locally inside your browser using{' '}
            <a
              href="https://webassembly.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#7047EB] dark:text-[#A78BFA] underline decoration-[#7047EB]/40 hover:decoration-[#7047EB]"
            >
              WebAssembly
            </a>
            ,{' '}
            <a
              href="https://www.iso.org/standard/51502.html"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#7047EB] dark:text-[#A78BFA] underline decoration-[#7047EB]/40 hover:decoration-[#7047EB]"
            >
              ISO 32000-1 PDF
            </a>
            ,{' '}
            <a
              href="https://datatracker.ietf.org/doc/html/rfc8259"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#7047EB] dark:text-[#A78BFA] underline decoration-[#7047EB]/40 hover:decoration-[#7047EB]"
            >
              IETF RFC 8259 JSON
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
            with zero file uploads.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-xs font-semibold text-[#171927] dark:text-[#E2E8F0] bg-[#F8F7FC] dark:bg-[#171927] p-4 rounded-2xl border border-[#E8E6F2] dark:border-[#2A2E42] shrink-0">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>100% Local Browser Processing</span>
          </div>
          <div className="flex items-center gap-2 text-[#64748B] dark:text-[#94A3B8]">
            <CheckCircle2 className="w-4 h-4 text-[#7047EB] shrink-0" aria-hidden="true" />
            <span>{TOOLS_CATALOG.length} Free Utilities · {HUBS.length} Categories</span>
          </div>
        </div>
      </div>

      {/* Section 1: Main Platform & 5 Category Hubs */}
      <section className="rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8E6F2] dark:border-[#2A2E42] pb-3">
          <h2 className="text-base sm:text-lg font-extrabold text-[#171927] dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#7047EB]" aria-hidden="true" />
            <span>Main Categories</span>
          </h2>
          <span className="text-xs font-semibold text-[#64748B]">{HUBS.length} Categories</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href={resolveHref('/')}
            onClick={(e) => {
              e.preventDefault();
              onNavigateHome();
            }}
            className="group p-4 rounded-xl bg-[#F8F7FC] dark:bg-[#171927] border border-[#E8E6F2] dark:border-[#2A2E42] hover:border-[#7047EB] transition-all flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <div className="text-sm font-bold text-[#171927] dark:text-white group-hover:text-[#7047EB] transition-colors">
                NextGenToolkit Home
              </div>
              <p className="text-xs text-[#64748B] line-clamp-1 mt-1">
                Master workbench, live search &amp; popular utilities
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#7047EB] shrink-0" aria-hidden="true" />
          </a>

          {HUBS.map((hub) => {
            const count = getToolsByHub(hub.id).length;
            return (
              <a
                key={hub.id}
                href={resolveHref(hub.slug)}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectHub(hub.id);
                }}
                className="group p-4 rounded-xl bg-[#F8F7FC] dark:bg-[#171927] border border-[#E8E6F2] dark:border-[#2A2E42] hover:border-[#7047EB] transition-all flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[#171927] dark:text-white group-hover:text-[#7047EB] transition-colors">
                    {hub.name} ({count})
                  </div>
                  <p className="text-xs text-[#64748B] line-clamp-1 mt-1">{hub.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#7047EB] shrink-0" aria-hidden="true" />
              </a>
            );
          })}
        </div>
      </section>

      {/* Section 2: All 25 Browser Tools Grouped by Category */}
      <div className="space-y-6">
        {HUBS.map((hub) => {
          const hubTools = getToolsByHub(hub.id);
          return (
            <section
              key={hub.id}
              className="rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E6F2] dark:border-[#2A2E42] pb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-xs shrink-0"
                    style={{ backgroundColor: hub.accentFg }}
                  />
                  <h2 className="text-base sm:text-lg font-extrabold text-[#171927] dark:text-white">
                    {hub.name}
                  </h2>
                </div>
                <a
                  href={resolveHref(hub.slug)}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectHub(hub.id);
                  }}
                  className="text-xs font-bold text-[#7047EB] hover:underline flex items-center gap-1"
                >
                  <span>View {hub.name} ({hubTools.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </div>

              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {hubTools.map((tool) => (
                  <li key={tool.id}>
                    <a
                      href={resolveHref(tool.canonicalPath)}
                      onClick={(e) => {
                        e.preventDefault();
                        onSelectTool(tool.id);
                      }}
                      className="group p-4 rounded-xl bg-[#F8F7FC] dark:bg-[#171927] border border-[#E8E6F2] dark:border-[#2A2E42] hover:border-[#7047EB] transition-all flex items-center justify-between gap-3 h-full"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-[#171927] dark:text-white group-hover:text-[#7047EB] transition-colors truncate">
                          {tool.name}
                        </div>
                        <p className="text-xs text-[#64748B] dark:text-[#94A3B8] line-clamp-1 mt-0.5">
                          {tool.shortDesc}
                        </p>
                      </div>
                      <ArrowRight
                        className="w-3.5 h-3.5 text-[#7047EB] shrink-0 group-hover:translate-x-0.5 transition-transform"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
