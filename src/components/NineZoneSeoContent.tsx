import React, { useState } from 'react';
import {
  ArrowRight,
  Code,
  Check,
  Copy,
  ShieldCheck,
  ChevronDown,
  FileCode2,
  Sparkles,
} from 'lucide-react';
import {
  ToolDefinition,
  TOOLS_CATALOG,
  getToolById,
  getHubById,
  HubId,
} from '../data/toolsCatalog';
import { buildToolJsonLd } from './SchemaHeadInjector';

interface NineZoneSeoContentProps {
  tool: ToolDefinition;
  onSelectTool: (toolId: string) => void;
  onSelectHub: (hubId: HubId) => void;
  onOpenSeoModal: (tab: 'llms' | 'llms-full' | 'robots' | 'sitemap' | 'design-system') => void;
}

export function NineZoneSeoContent({
  tool,
  onSelectTool,
  onSelectHub,
  onOpenSeoModal,
}: NineZoneSeoContentProps) {
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const [showSchemaPreview, setShowSchemaPreview] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const nextTool = getToolById(tool.nextStepToolId) || TOOLS_CATALOG[0];
  const parentHub = getHubById(tool.hubId);

  // 4 sibling tools from same category hub + 2 cross-hub tools (Section 8.3 of Blueprint)
  const siblingTools = TOOLS_CATALOG.filter(
    (t) => t.hubId === tool.hubId && t.id !== tool.id
  ).slice(0, 4);
  const crossHubTools = TOOLS_CATALOG.filter((t) => t.hubId !== tool.hubId).slice(0, 2);
  const relatedMesh = [...siblingTools, ...crossHubTools];

  const embedSnippet = `<iframe src="${import.meta.env.VITE_SITE_URL || window.location.origin}${tool.canonicalPath}?embed=1" width="100%" height="520" style="border:1px solid #E8E6F2;border-radius:16px;" loading="lazy" title="Utilix ${tool.name}"></iframe>\n<p style="font-size:12px;color:#64748B;margin-top:6px;">Powered by <a href="${import.meta.env.VITE_SITE_URL || window.location.origin}${tool.canonicalPath}" target="_blank" rel="noopener">Utilix ${tool.name} (Browser-Based Utility)</a></p>`;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedSnippet);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 1800);
  };

  return (
    <div className="space-y-10 mt-10">
      {/* =====================================================================
          ZONE 4: Workflow Chaining Bar + Phase 3 Embeddable Link Magnet
      ===================================================================== */}
      <section
        aria-label="Workflow Next-Step Chaining"
        className="rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="text-xs font-semibold text-[#7047EB]">
            Workflow Chaining · Zero Re-Upload Handoff
          </div>
          <p className="text-sm font-medium text-[#171927] dark:text-[#F8F7FC]">
            {tool.nextStepPrompt}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowEmbedCode(!showEmbedCode)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] text-xs font-semibold text-[#253044] dark:text-[#E2E8F0] hover:border-[#7047EB] transition-colors whitespace-nowrap shrink-0"
          >
            <Code className="w-3.5 h-3.5 text-[#7047EB]" />
            <span>Free Embed Widget</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectTool(nextTool.id)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7047EB] hover:bg-[#5E35D9] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <span>Open {nextTool.name}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {showEmbedCode && (
        <div className="rounded-2xl bg-[#131520] text-[#E2E8F0] p-5 border border-[#2A2E42] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A78BFA]">
              Embed {tool.name} on Your Website or Developer Docs (Phase 3 Link Magnet)
            </span>
            <button
              type="button"
              onClick={handleCopyEmbed}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#7047EB] text-white text-xs font-semibold"
            >
              {copiedEmbed ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEmbed ? 'Copied Snippet' : 'Copy iframe Code'}</span>
            </button>
          </div>
          <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap text-slate-300">
            {embedSnippet}
          </pre>
        </div>
      )}

      {/* =====================================================================
          ZONE 5: GEO Citation-Ready Entity Definition + AEO Direct Answer & 3-Step How-To
      ===================================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#7047EB]">
            <Sparkles className="w-4 h-4" />
            <span>How It Works · AEO Direct Featured Snippet</span>
          </div>
          <h2 className="text-xl font-bold text-[#171927] dark:text-[#F8F7FC] tracking-tight">
            {tool.aeoQuestionHeading}
          </h2>
          <p className="text-sm text-[#253044] dark:text-[#CBD5E1] leading-relaxed">
            {tool.aeoSummaryParagraph}
          </p>
          <ol className="space-y-3 pt-2">
            {tool.howToSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#EDE7FF] dark:bg-[#7047EB]/25 text-[#7047EB] dark:text-[#A78BFA] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                  {idx + 1}
                </span>
                <div className="text-sm">
                  <span className="font-semibold text-[#171927] dark:text-[#F8F7FC]">
                    {step.name}:{' '}
                  </span>
                  <span className="text-[#64748B] dark:text-[#94A3B8]">{step.text}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="lg:col-span-5 rounded-2xl bg-[#F4F1FF] dark:bg-[#1E1B36] border border-[#DDD6FE] dark:border-[#37306B] p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#7047EB] text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#171927] dark:text-[#F8F7FC]">
                  Your Privacy Matters · Entity Citation
                </h3>
                <p className="text-xs text-[#6D28D9] dark:text-[#A78BFA]">
                  Tool-specific processing model
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#253044] dark:text-[#E2E8F0] leading-relaxed">
              {tool.entityLeadSentence}
            </p>
          </div>

          <div className="pt-3 border-t border-[#DDD6FE] dark:border-[#37306B] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#64748B] dark:text-[#94A3B8]">Processing model:</span>
              <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                {tool.specTable.privacyModel}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#64748B] dark:text-[#94A3B8]">Canonical Slug:</span>
              <span className="font-mono text-[#171927] dark:text-[#F8F7FC]">
                {tool.canonicalPath}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          ZONE 6: GEO Structured Comparison & Deterministic Specification Tables
      ===================================================================== */}
      <section className="rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-[#171927] dark:text-[#F8F7FC]">
              Processing details for {tool.name}
            </h2>
            <p className="text-xs text-[#64748B]">
              A summary of this tool's implementation. Performance and privacy depend on the selected tool and device.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowSchemaPreview(!showSchemaPreview)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] text-xs font-semibold text-[#7047EB] hover:bg-[#F8F7FC] dark:hover:bg-[#252A3F] whitespace-nowrap shrink-0"
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>{showSchemaPreview ? 'Hide JSON-LD Schema' : 'Inspect Head JSON-LD Schema'}</span>
          </button>
        </div>

        {showSchemaPreview && (
          <pre className="p-4 rounded-xl bg-[#131520] text-[#E2E8F0] font-mono text-xs overflow-x-auto max-h-72">
            {JSON.stringify(buildToolJsonLd(tool), null, 2)}
          </pre>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#E8E6F2] dark:border-[#2A2E42] text-[#64748B]">
                <th className="py-3 pr-4 font-semibold">Benchmark Dimension</th>
                <th className="py-3 px-4 font-semibold text-[#7047EB]">
                  Utilix ({tool.name})
                </th>
                <th className="py-3 pl-4 font-semibold">Other providers (varies)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E6F2] dark:divide-[#2A2E42] tabular-nums">
              <tr>
                <td className="py-3 pr-4 font-medium text-[#171927] dark:text-[#F8F7FC]">
                  Data Privacy & Architecture
                </td>
                <td className="py-3 px-4 font-semibold text-emerald-700 dark:text-emerald-400">
                  {tool.specTable.privacyModel}
                </td>
                <td className="py-3 pl-4 text-[#64748B]">
                  Processing and retention policies vary by provider; review its privacy documentation.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-[#171927] dark:text-[#F8F7FC]">
                  Core Execution Engine
                </td>
                <td className="py-3 px-4 text-[#171927] dark:text-[#E2E8F0]">
                  {tool.specTable.executionEngine}
                </td>
                <td className="py-3 pl-4 text-[#64748B]">
                  Implementation varies by provider and feature.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-[#171927] dark:text-[#F8F7FC]">
                  Supported Formats
                </td>
                <td className="py-3 px-4 font-mono text-xs text-[#171927] dark:text-[#E2E8F0]">
                  {tool.specTable.supportedFormats}
                </td>
                <td className="py-3 pl-4 text-[#64748B]">
                  Supported formats and plan limits vary by provider.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-[#171927] dark:text-[#F8F7FC]">
                  Batch Capacity & ZIP Export
                </td>
                <td className="py-3 px-4 text-[#171927] dark:text-[#E2E8F0]">
                  {tool.specTable.batchSupport}
                </td>
                <td className="py-3 pl-4 text-[#64748B]">
                  Batch limits and pricing vary by provider.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-[#171927] dark:text-[#F8F7FC]">
                  Execution Latency (INP)
                </td>
                <td className="py-3 px-4 font-mono text-emerald-700 dark:text-emerald-400">
                  Depends on device, input size and browser workload.
                </td>
                <td className="py-3 pl-4 text-[#64748B]">
                  Network and processing time vary by provider and file size.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-[#171927] dark:text-[#F8F7FC]">
                  Cost & Registration
                </td>
                <td className="py-3 px-4 font-semibold text-[#7047EB]">
                  Free to use · No account required
                </td>
                <td className="py-3 pl-4 text-[#64748B]">
                  Account requirements, usage limits and output rules vary.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* =====================================================================
          ZONE 7: Deep Technical & LSI Use-Case Guide
      ===================================================================== */}
      <section className="rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] p-6 space-y-5">
        <h2 className="text-lg font-bold text-[#171927] dark:text-[#F8F7FC]">
          Technical Architecture & Real-World Use Cases for {tool.name}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[#253044] dark:text-[#CBD5E1] leading-relaxed">
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-[#171927] dark:text-[#F8F7FC]">
              01. How this tool processes data
            </h3>
            <p>
              <strong>Utilix {tool.name}</strong> uses <code>{tool.specTable.executionEngine}</code>. Its listed processing model is: {tool.specTable.privacyModel}. Browser extensions, external libraries, and optional network-powered features may still make separate requests; avoid entering highly sensitive information unless you have verified the behavior of the specific tool.
            </p>
          </div>
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-[#171927] dark:text-[#F8F7FC]">
              02. Supported workflow and limits
            </h3>
            <p>
              This tool supports the workflow and batch behavior listed in its specification. Actual capacity and responsiveness depend on browser support, available memory, device performance and input size. Common use cases include {tool.clusteredQueries.join(', ')}.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-[#E8E6F2] dark:border-[#2A2E42] flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#64748B]">
          <span className="font-semibold text-[#171927] dark:text-[#F8F7FC]">
            Semantic Entities & LSI Coverage:
          </span>
          {tool.lsiKeywords.map((kw, i) => (
            <React.Fragment key={kw}>
              <span>{kw}</span>
              {i < tool.lsiKeywords.length - 1 && <span aria-hidden="true">·</span>}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* =====================================================================
          ZONE 8: People Also Ask (PAA) Semantic FAQ Section (Synced with FAQPage JSON-LD)
      ===================================================================== */}
      <section className="rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[#171927] dark:text-[#F8F7FC]">
            Frequently Asked Questions — {tool.name}
          </h2>
          <p className="text-xs text-[#64748B]">
            Answers to common questions about using this tool. Search engines decide independently how page content appears in results.
          </p>
        </div>

        <div className="divide-y divide-[#E8E6F2] dark:divide-[#2A2E42]">
          {tool.faqs.map((faq, idx) => (
            <details key={idx} className="group py-3.5" open={idx === 0}>
              <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-semibold text-[#171927] dark:text-[#F8F7FC] hover:text-[#7047EB]">
                <span>{faq.q}</span>
                <ChevronDown className="w-4 h-4 text-[#64748B] group-open:rotate-180 transition-transform shrink-0 ml-2" />
              </summary>
              <p className="mt-2 text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* =====================================================================
          ZONE 9: Internal Link Mesh (4 Sibling Hub Tools + 2 Cross-Hub Tools)
      ===================================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#171927] dark:text-[#F8F7FC]">
              Related Client-Side Utilities & Internal Workflow Mesh
            </h2>
            <p className="text-xs text-[#64748B]">
              Explore sibling tools in {parentHub?.name} and cross-hub utilities.
            </p>
          </div>
          {parentHub && (
            <button
              type="button"
              onClick={() => onSelectHub(parentHub.id)}
              className="text-xs font-semibold text-[#7047EB] hover:underline flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              <span>View All {parentHub.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {relatedMesh.map((rel) => {
            const relHub = getHubById(rel.hubId);
            return (
              <button
                key={rel.id}
                type="button"
                onClick={() => onSelectTool(rel.id)}
                className="group p-4 rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] hover:border-[#7047EB] text-left transition-all flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-xs text-[#64748B] mb-0.5">{relHub?.name}</div>
                  <div className="text-sm font-bold text-[#171927] dark:text-[#F8F7FC] group-hover:text-[#7047EB] transition-colors truncate">
                    {rel.name}
                  </div>
                  <p className="text-xs text-[#64748B] line-clamp-1 mt-0.5">{rel.shortDesc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#7047EB] shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </button>
            );
          })}
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-[#64748B]">
          <div className="flex flex-wrap items-center gap-3">
            <span>GEO Crawler Directories:</span>
            <button
              type="button"
              onClick={() => onOpenSeoModal('llms')}
              className="font-mono text-[#7047EB] hover:underline"
            >
              /llms.txt
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => onOpenSeoModal('llms-full')}
              className="font-mono text-[#7047EB] hover:underline"
            >
              /llms-full.txt
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => onOpenSeoModal('robots')}
              className="font-mono text-[#7047EB] hover:underline"
            >
              /robots.txt
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => onOpenSeoModal('sitemap')}
              className="font-mono text-[#7047EB] hover:underline"
            >
              /sitemap.xml
            </button>
          </div>
          <span>100% Permissive MIT / ISC / BSD Open-Source Engines</span>
        </div>
      </section>
    </div>
  );
}
