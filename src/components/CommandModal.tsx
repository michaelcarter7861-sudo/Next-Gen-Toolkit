import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  ArrowRight,
  FileCode2,
  Globe,
  BrainCircuit,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Download,
} from 'lucide-react';
import { TOOLS_CATALOG, HUBS, ToolDefinition, HubId } from '../data/toolsCatalog';

interface CommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (toolId: string) => void;
  onSelectHub: (hubId: HubId) => void;
}

export function CommandModal({ isOpen, onClose, onSelectTool, onSelectHub }: CommandModalProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();
  const filteredTools = TOOLS_CATALOG.filter(
    (t) =>
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.shortDesc.toLowerCase().includes(q) ||
      t.primaryKeyword.toLowerCase().includes(q) ||
      t.lsiKeywords.some((k) => k.toLowerCase().includes(q))
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-xs pt-20 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Quick Tool Launcher"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E8E6F2] dark:border-[#2A2E42]">
          <Search className="w-5 h-5 text-[#7047EB] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all 25 client-side tools by name, keyword, or format (e.g. PDF, 20KB, JSON, QR)..."
            className="w-full bg-transparent text-sm text-[#171927] dark:text-[#F8F7FC] placeholder-[#64748B] focus:outline-none"
          />
          <button
            onClick={onClose}
            aria-label="Close launcher"
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#171927] dark:hover:text-white hover:bg-[#F8F7FC] dark:hover:bg-[#252A3F]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-3 space-y-4">
          {!q && (
            <div>
              <div className="px-3 py-1 text-xs font-semibold text-[#64748B]">Category Hubs (5)</div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-1">
                {HUBS.map((hub) => (
                  <button
                    key={hub.id}
                    onClick={() => {
                      onSelectHub(hub.id);
                      onClose();
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left border border-[#E8E6F2] dark:border-[#2A2E42] hover:border-[#7047EB] transition-colors"
                  >
                    <span className="truncate">{hub.shortTitle}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#7047EB] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="px-3 py-1 text-xs font-semibold text-[#64748B]">
              Matching Utilities ({filteredTools.length})
            </div>
            <div className="space-y-1 mt-1">
              {filteredTools.map((tool) => {
                const hub = HUBS.find((h) => h.id === tool.hubId);
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      onSelectTool(tool.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between gap-4 px-3 py-2.5 rounded-xl hover:bg-[#F8F7FC] dark:hover:bg-[#252A3F] text-left transition-colors group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#171927] dark:text-[#F8F7FC] group-hover:text-[#7047EB] transition-colors">
                          {tool.name}
                        </span>
                        <span className="text-xs text-[#64748B]">· {hub?.shortTitle}</span>
                      </div>
                      <p className="text-xs text-[#64748B] truncate">{tool.shortDesc}</p>
                    </div>
                    <span className="text-xs font-mono text-[#64748B] group-hover:text-[#7047EB] shrink-0">
                      {tool.canonicalPath}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-3 bg-[#F8F7FC] dark:bg-[#151824] border-t border-[#E8E6F2] dark:border-[#2A2E42] text-xs text-[#64748B]">
          <span>100% Client-Side Execution · 0 Bytes Uploaded</span>
          <span>Press Esc to close</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SEO / GEO Root Files & Design System Inspector Modal
// ============================================================================

interface SeoGeoInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'llms' | 'llms-full' | 'robots' | 'sitemap' | 'design-system';
}

export function SeoGeoInspectorModal({
  isOpen,
  onClose,
  initialTab = 'llms',
}: SeoGeoInspectorModalProps) {
  const [activeTab, setActiveTab] = useState<'llms' | 'llms-full' | 'robots' | 'sitemap' | 'design-system'>(
    initialTab
  );
  const [fileContent, setFileContent] = useState<string>('Loading production root file...');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!isOpen || activeTab === 'design-system') return;
    const pathMap: Record<string, string> = {
      llms: '/llms.txt',
      'llms-full': '/llms-full.txt',
      robots: '/robots.txt',
      sitemap: '/sitemap.xml',
    };
    const assetPath = `${import.meta.env.BASE_URL}${pathMap[activeTab].replaceAll('/', '')}`;
    fetch(assetPath)
      .then((r) => r.text())
      .then((txt) => setFileContent(txt))
      .catch(() => setFileContent('Failed to load file.'));
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = () => {
    const filenameMap: Record<string, string> = {
      llms: 'llms.txt',
      'llms-full': 'llms-full.txt',
      robots: 'robots.txt',
      sitemap: 'sitemap.xml',
    };
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filenameMap[activeTab] || 'utilix-file.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Technical SEO, GEO & Design System Inspector"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E6F2] dark:border-[#2A2E42]">
          <div className="flex items-center gap-2.5">
            <FileCode2 className="w-5 h-5 text-[#7047EB]" />
            <h2 className="text-base font-bold text-[#171927] dark:text-[#F8F7FC]">
              Utilix Technical SEO, GEO Root Files & Design System
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close inspector"
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#171927] dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-3 bg-[#F8F7FC] dark:bg-[#151824] border-b border-[#E8E6F2] dark:border-[#2A2E42]">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'llms', label: '/llms.txt (GEO)' },
              { id: 'llms-full', label: '/llms-full.txt (RAG)' },
              { id: 'robots', label: '/robots.txt' },
              { id: 'sitemap', label: '/sitemap.xml (31 URLs)' },
              { id: 'design-system', label: 'Extracted UI Design System' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as typeof activeTab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === t.id
                    ? 'bg-[#7047EB] text-white'
                    : 'text-[#64748B] hover:text-[#171927] dark:hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeTab !== 'design-system' && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#E8E6F2] dark:border-[#2A2E42] bg-white dark:bg-[#1C1F2E] text-[#171927] dark:text-[#F8F7FC] hover:border-[#7047EB]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy File'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#7047EB] text-white hover:bg-[#5E35D9]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          )}
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'design-system' ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-[#171927] dark:text-[#F8F7FC] mb-3">
                  Brand Colors (Extracted 1:1 from Uploaded Design Reference)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { name: 'Primary', hex: '#7047EB' },
                    { name: 'Deep', hex: '#253044' },
                    { name: 'Ink', hex: '#171927' },
                    { name: 'Canvas', hex: '#F8F7FC' },
                    { name: 'Surface', hex: '#FFFFFF' },
                  ].map((c) => (
                    <div
                      key={c.name}
                      className="p-3 rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] bg-white dark:bg-[#151824]"
                    >
                      <div
                        className="h-12 w-full rounded-lg border border-black/10 mb-2"
                        style={{ backgroundColor: c.hex }}
                      />
                      <div className="text-xs font-bold text-[#171927] dark:text-[#F8F7FC]">{c.name}</div>
                      <div className="text-xs font-mono text-[#64748B]">{c.hex}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#171927] dark:text-[#F8F7FC] mb-3">
                  Category Accents (Extracted 1:1 from Uploaded Design Reference)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  {[
                    { name: 'Text', hex: '#EDE7FF' },
                    { name: 'Images', hex: '#E1F0FF' },
                    { name: 'PDF', hex: '#FFE7EC' },
                    { name: 'Developer', hex: '#E0F7F0' },
                    { name: 'Calculators', hex: '#FFF1D9' },
                    { name: 'AI', hex: '#F4E5FF' },
                  ].map((c) => (
                    <div
                      key={c.name}
                      className="p-3 rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] bg-white dark:bg-[#151824]"
                    >
                      <div
                        className="h-10 w-full rounded-lg border border-black/5 mb-2"
                        style={{ backgroundColor: c.hex }}
                      />
                      <div className="text-xs font-bold text-[#171927] dark:text-[#F8F7FC]">{c.name}</div>
                      <div className="text-xs font-mono text-[#64748B]">{c.hex}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F7FC] dark:bg-[#151824] border border-[#E8E6F2] dark:border-[#2A2E42]">
                <h3 className="text-sm font-bold text-[#171927] dark:text-[#F8F7FC] mb-2">
                  Typography & Spatial Grid Tokens
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Heading (700 Bold) · Subheading (600 SemiBold) · Body (400 Regular) · Monospace Telemetry (JetBrains Mono Tabular Numerals). Container Max-Width: 1200px, Workspace Card Radius: 16px (`rounded-2xl`), Dropzone: Dashed `#C7B8F9` border on `#F8F7FC` canvas.
                </p>
              </div>
            </div>
          ) : (
            <pre className="p-4 rounded-xl bg-[#131520] text-[#E2E8F0] font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap">
              {fileContent}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// AI Search Grounding (gemini-4-hydrogen) & High Thinking (gemini-4-carbon) Studio Modal
// ============================================================================

interface AiStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: string;
}

export function AiWorkflowModal({ isOpen, onClose, initialContext = '' }: AiStudioModalProps) {
  const [mode, setMode] = useState<'search' | 'think'>('search');
  const [query, setQuery] = useState(
    'What are the latest Core Web Vitals LCP/INP benchmarks and Google Search structured data best practices for web utilities?'
  );
  const [contextInput, setContextInput] = useState(initialContext);
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState('');
  const [resultModel, setResultModel] = useState('');
  const [sources, setSources] = useState<{ uri: string; title: string }[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialContext) setContextInput(initialContext);
  }, [initialContext]);

  if (!isOpen) return null;

  const runAiQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (import.meta.env.VITE_STATIC_DEPLOYMENT === 'true') {
      setErrorMsg('AI Search requires the optional server API and is not available in this static hosting build. The browser-based utility tools remain available.');
      return;
    }
    if (!query.trim()) {
      setErrorMsg('Please enter a query before running the AI workflow.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setResultText('');
    setSources([]);

    try {
      const endpoint = mode === 'search' ? '/api/ai/search-grounding' : '/api/ai/deep-think';
      const payload =
        mode === 'search'
          ? { query, context: contextInput }
          : { prompt: query, codeOrData: contextInput };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Request failed.');
      } else {
        setResultText(data.text || '');
        setResultModel(data.model || '');
        setSources(data.sources || []);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Network error calling server endpoint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-label="AI Search Grounding and High-Thinking Studio"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E6F2] dark:border-[#2A2E42]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F4E5FF] text-[#7E22CE] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#171927] dark:text-[#F8F7FC]">
                Utilix Hybrid AI Workflow & Search Grounding Studio
              </h2>
              <p className="text-xs text-[#64748B]">
                Server-side proxy powered by Google Search Grounding (gemini-4-hydrogen) & High Thinking (gemini-4-carbon)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close AI Studio"
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#171927] dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-[#F8F7FC] dark:bg-[#151824] border border-[#E8E6F2] dark:border-[#2A2E42]">
            <button
              type="button"
              onClick={() => {
                setMode('search');
                setQuery(
                  'What are the latest Core Web Vitals LCP/INP benchmarks and Google Search structured data best practices for web utilities?'
                );
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                mode === 'search'
                  ? 'bg-[#7047EB] text-white'
                  : 'text-[#64748B] hover:text-[#171927] dark:hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Google Search Grounding (gemini-4-hydrogen)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('think');
                setQuery(
                  'Design an optimal client-side Web Worker + binary-search quantization algorithm to compress 4K PNGs under 50KB while preserving text legibility.'
                );
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                mode === 'think'
                  ? 'bg-[#7047EB] text-white'
                  : 'text-[#64748B] hover:text-[#171927] dark:hover:text-white'
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              <span>High-Thinking Mode (gemini-4-carbon · HIGH)</span>
            </button>
          </div>

          <form onSubmit={runAiQuery} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#171927] dark:text-[#F8F7FC] mb-1">
                {mode === 'search'
                  ? 'Live Web Search & Grounding Query'
                  : 'Complex Engineering, Regex, Schema, or Architecture Query'}
              </label>
              <textarea
                rows={2}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] bg-[#F8F7FC] dark:bg-[#151824] px-3.5 py-2.5 text-sm text-[#171927] dark:text-[#F8F7FC] focus:outline-none focus:border-[#7047EB]"
                placeholder="Ask a question..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] mb-1">
                Optional Code / JSON / SEO Context Snippet
              </label>
              <textarea
                rows={2}
                value={contextInput}
                onChange={(e) => setContextInput(e.target.value)}
                className="w-full rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] bg-[#F8F7FC] dark:bg-[#151824] px-3.5 py-2 text-xs font-mono text-[#171927] dark:text-[#F8F7FC] focus:outline-none focus:border-[#7047EB]"
                placeholder="Paste optional JSON, Regex, or tool output context here..."
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-xs text-[#64748B]">
                <span>
                  {mode === 'search'
                    ? 'Uses googleSearch tool for live web citations'
                    : 'Uses ThinkingLevel.HIGH for deep multi-step reasoning'}
                </span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-[#7047EB] hover:bg-[#5E35D9] disabled:opacity-50 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                {loading
                  ? mode === 'search'
                    ? 'Searching Google & Synthesizing...'
                    : 'Deep Thinking (HIGH)...'
                  : mode === 'search'
                    ? 'Run Grounded Search'
                    : 'Run High-Thinking Analysis'}
              </button>
            </div>
          </form>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-xs text-red-700 dark:text-red-300">
              {errorMsg}
            </div>
          )}

          {resultText && (
            <div className="p-4 rounded-xl bg-[#F8F7FC] dark:bg-[#151824] border border-[#E8E6F2] dark:border-[#2A2E42] space-y-3">
              <div className="flex items-center justify-between text-xs text-[#64748B] border-b border-[#E8E6F2] dark:border-[#2A2E42] pb-2">
                <span className="font-semibold text-[#7047EB]">{resultModel}</span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(resultText)}
                  className="hover:text-[#171927] dark:hover:text-white font-medium"
                >
                  Copy Response
                </button>
              </div>
              <div className="text-xs sm:text-sm text-[#171927] dark:text-[#E2E8F0] whitespace-pre-wrap leading-relaxed">
                {resultText}
              </div>

              {sources.length > 0 && (
                <div className="pt-3 border-t border-[#E8E6F2] dark:border-[#2A2E42]">
                  <div className="text-xs font-semibold text-[#171927] dark:text-[#F8F7FC] mb-2">
                    Google Search Grounding Citations ({sources.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sources.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] text-xs text-[#7047EB] hover:underline"
                      >
                        <span className="truncate max-w-[220px]">{s.title}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
