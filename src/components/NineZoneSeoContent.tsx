import React, { useState } from 'react';
import {
  ArrowRight,
  Code,
  Check,
  Copy,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Tag,
} from 'lucide-react';
import {
  ToolDefinition,
  TOOLS_CATALOG,
  getToolById,
  getHubById,
  HubId,
} from '../data/toolsCatalog';

interface NineZoneSeoContentProps {
  tool: ToolDefinition;
  onSelectTool: (toolId: string) => void;
  onSelectHub: (hubId: HubId) => void;
}

export function NineZoneSeoContent({
  tool,
  onSelectTool,
  onSelectHub,
}: NineZoneSeoContentProps) {
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const nextTool = getToolById(tool.nextStepToolId) || TOOLS_CATALOG[0];
  const parentHub = getHubById(tool.hubId);

  // 4 sibling tools from same category hub + 2 cross-hub tools
  const siblingTools = TOOLS_CATALOG.filter(
    (t) => t.hubId === tool.hubId && t.id !== tool.id
  ).slice(0, 4);
  const crossHubTools = TOOLS_CATALOG.filter((t) => t.hubId !== tool.hubId).slice(0, 2);
  const relatedMesh = [...siblingTools, ...crossHubTools];

  const embedSnippet = `<iframe src="${import.meta.env.VITE_SITE_URL || window.location.origin}${tool.canonicalPath}?embed=1" width="100%" height="520" style="border:1px solid #E8E6F2;border-radius:16px;" loading="lazy" title="NextGenToolkit ${tool.name}"></iframe>\n<p style="font-size:12px;color:#64748B;margin-top:6px;">Powered by <a href="${import.meta.env.VITE_SITE_URL || window.location.origin}${tool.canonicalPath}" target="_blank" rel="noopener">NextGenToolkit ${tool.name}</a></p>`;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedSnippet);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 1800);
  };

  return (
    <div className="space-y-10 mt-10">
      {/* =====================================================================
          ZONE 4: Workflow Chaining Bar + Embeddable Widget
      ===================================================================== */}
      <section
        aria-label="Next Step Tool Recommendation"
        className="rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="text-xs font-semibold text-[#7047EB]">
            Recommended Next Step
          </div>
          <p className="text-sm font-medium text-[#171927] dark:text-[#F8F7FC]">
            {tool.nextStepPrompt}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowEmbedCode(!showEmbedCode)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] text-xs font-semibold text-[#253044] dark:text-[#E2E8F0] hover:border-[#7047EB] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Code className="w-3.5 h-3.5 text-[#7047EB]" />
            <span>Embed Tool</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectTool(nextTool.id)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7047EB] hover:bg-[#5E35D9] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
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
              Embed {tool.name} on Your Website
            </span>
            <button
              type="button"
              onClick={handleCopyEmbed}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#7047EB] text-white text-xs font-semibold cursor-pointer"
            >
              {copiedEmbed ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEmbed ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
          <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap text-slate-300">
            {embedSnippet}
          </pre>
        </div>
      )}

      {/* =====================================================================
          ZONE 5: How It Works & Privacy Summary
      ===================================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#7047EB]">
            <Sparkles className="w-4 h-4" />
            <span>How It Works</span>
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
                  Your Privacy Matters
                </h3>
                <p className="text-xs text-[#6D28D9] dark:text-[#A78BFA]">
                  Local browser execution
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#253044] dark:text-[#E2E8F0] leading-relaxed">
              {tool.entityLeadSentence}
            </p>
          </div>

          <div className="pt-3 border-t border-[#DDD6FE] dark:border-[#37306B] space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#64748B] dark:text-[#94A3B8]">Privacy guarantee:</span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                {tool.specTable.privacyModel}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#64748B] dark:text-[#94A3B8]">Supported formats:</span>
              <span className="font-medium text-[#171927] dark:text-[#F8F7FC] text-right">
                {tool.specTable.supportedFormats}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          ZONE 6: Specifications & Feature Comparison Table
      ===================================================================== */}
      <section className="rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-[#171927] dark:text-[#F8F7FC]">
            Specifications &amp; Capabilities — {tool.name}
          </h2>
          <p className="text-xs text-[#64748B]">
            Overview of supported file formats, batch processing, and browser privacy features.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#E8E6F2] dark:border-[#2A2E42] text-[#64748B]">
                <th className="py-3 pr-4 font-semibold">Feature</th>
                <th className="py-3 px-4 font-semibold text-[#7047EB]">
                  NextGenToolkit ({tool.name})
                </th>
                <th className="py-3 pl-4 font-semibold">Standard Cloud Tools</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E6F2] dark:divide-[#2A2E42] tabular-nums">
              <tr>
                <td className="py-3 pr-4 font-medium text-[#171927] dark:text-[#F8F7FC]">
                  Data Privacy &amp; Security
                </td>
                <td className="py-3 px-4 font-semibold text-emerald-700 dark:text-emerald-400">
                  {tool.specTable.privacyModel}
                </td>
                <td className="py-3 pl-4 text-[#64748B]">
                  Files are typically uploaded to remote servers for processing.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-[#171927] dark:text-[#F8F7FC]">
                  Processing Engine
                </td>
                <td className="py-3 px-4 text-[#171927] dark:text-[#E2E8F0]">
                  {tool.specTable.executionEngine}
                </td>
                <td className="py-3 pl-4 text-[#64748B]">
                  Varies by provider and server queue load.
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
                  Often restricted on free tiers.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-[#171927] dark:text-[#F8F7FC]">
                  Batch Support &amp; Export
                </td>
                <td className="py-3 px-4 text-[#171927] dark:text-[#E2E8F0]">
                  {tool.specTable.batchSupport}
                </td>
                <td className="py-3 pl-4 text-[#64748B]">
                  Daily file limits or paid upgrades often required.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-[#171927] dark:text-[#F8F7FC]">
                  Cost &amp; Registration
                </td>
                <td className="py-3 px-4 font-semibold text-[#7047EB]">
                  100% Free · No Sign-Up or Watermarks
                </td>
                <td className="py-3 pl-4 text-[#64748B]">
                  Account registration or subscription often required.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* =====================================================================
          ZONE 7: Features, Use Cases & Related Topics (Natural SEO + LSI Coverage)
      ===================================================================== */}
      <section className="rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] p-6 space-y-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-[#171927] dark:text-[#F8F7FC]">
            Features &amp; Supported Use Cases for {tool.name}
          </h2>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EDE7FF] dark:bg-[#7047EB]/20 text-xs font-semibold text-[#7047EB] dark:text-[#C4B5FD]">
            <Tag className="w-3.5 h-3.5" />
            <span>{tool.subCategory}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[#253044] dark:text-[#CBD5E1] leading-relaxed">
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-[#171927] dark:text-[#F8F7FC]">
              Fast In-Browser Processing
            </h3>
            <p>
              <strong>NextGenToolkit {tool.name}</strong> is powered by {tool.specTable.executionEngine} ({tool.specTable.privacyModel}). Because everything runs directly on your device, your documents, photos, and code snippets never wait in a server upload queue.
            </p>
          </div>
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-[#171927] dark:text-[#F8F7FC]">
              Common Workflows &amp; Applications
            </h3>
            <p>
              Designed for everyday productivity and developer workflows including {tool.clusteredQueries.join(', ')}. Works seamlessly across desktop and mobile browsers with {tool.specTable.batchSupport}.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E8E6F2] dark:border-[#2A2E42] space-y-3">
          <div className="text-xs font-bold text-[#171927] dark:text-[#F8F7FC]">
            Key Capabilities &amp; Topics:
          </div>
          <div className="flex flex-wrap gap-2">
            {tool.lsiKeywords.map((kw) => (
              <span
                key={kw}
                className="px-2.5 py-1 rounded-lg bg-[#F8F7FC] dark:bg-[#151824] border border-[#E8E6F2] dark:border-[#2A2E42] text-xs font-medium text-[#253044] dark:text-[#CBD5E1]"
              >
                {kw}
              </span>
            ))}
          </div>

          <div className="text-xs font-bold text-[#171927] dark:text-[#F8F7FC] pt-1">
            Popular Tasks:
          </div>
          <div className="flex flex-wrap gap-2">
            {tool.clusteredQueries.map((cq) => (
              <span
                key={cq}
                className="px-2.5 py-1 rounded-lg bg-[#EDE7FF]/60 dark:bg-[#7047EB]/15 text-xs font-medium text-[#6D28D9] dark:text-[#C4B5FD]"
              >
                {cq}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          ZONE 8: Frequently Asked Questions
      ===================================================================== */}
      <section className="rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[#171927] dark:text-[#F8F7FC]">
            Frequently Asked Questions — {tool.name}
          </h2>
          <p className="text-xs text-[#64748B]">
            Common questions and tips for getting the best results with {tool.name}.
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
          ZONE 9: Related Tools
      ===================================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#171927] dark:text-[#F8F7FC]">
              Related Tools You Might Like
            </h2>
            <p className="text-xs text-[#64748B]">
              Explore more utilities in {parentHub?.name} and across NextGenToolkit.
            </p>
          </div>
          {parentHub && (
            <button
              type="button"
              onClick={() => onSelectHub(parentHub.id)}
              className="text-xs font-semibold text-[#7047EB] hover:underline flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
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
                className="group p-4 rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] hover:border-[#7047EB] text-left transition-all flex items-center justify-between gap-3 cursor-pointer"
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
      </section>
    </div>
  );
}
