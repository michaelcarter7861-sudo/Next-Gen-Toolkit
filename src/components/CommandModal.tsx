import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Star,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { TOOLS_CATALOG, HUBS, HubId } from '../data/toolsCatalog';

interface CommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (toolId: string) => void;
  onSelectHub: (hubId: HubId) => void;
  favoriteIds?: string[];
  onToggleFavorite?: (toolId: string) => void;
}

export function CommandModal({
  isOpen,
  onClose,
  onSelectTool,
  onSelectHub,
  favoriteIds = [],
  onToggleFavorite,
}: CommandModalProps) {
  const [query, setQuery] = useState('');
  const [selectedHubFilter, setSelectedHubFilter] = useState<HubId | 'all' | 'favorites'>('all');

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedHubFilter('all');
    }
  }, [isOpen]);

  // Focus management: move focus in on open, keep Tab inside the dialog, and
  // restore the trigger on close. Escape closes from anywhere in the dialog.
  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => searchRef.current?.focus(), 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const root = dialogRef.current;
      if (!root) return;
      const focusable = root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = overflow;
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen, onClose]);

  const q = query.trim().toLowerCase();
  const filteredTools = useMemo(() => {
    return TOOLS_CATALOG.filter((t) => {
      if (selectedHubFilter === 'favorites' && !favoriteIds.includes(t.id)) return false;
      if (selectedHubFilter !== 'all' && selectedHubFilter !== 'favorites' && t.hubId !== selectedHubFilter) {
        return false;
      }
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.shortDesc.toLowerCase().includes(q) ||
        t.primaryKeyword.toLowerCase().includes(q) ||
        t.lsiKeywords.some((k) => k.toLowerCase().includes(q)) ||
        t.clusteredQueries.some((cq) => cq.toLowerCase().includes(q))
      );
    });
  }, [q, selectedHubFilter, favoriteIds]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/55 backdrop-blur-xs pt-16 sm:pt-20 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="NextGenToolkit Quick Tool Launcher"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E8E6F2] dark:border-[#2A2E42]">
          <Search className="w-5 h-5 text-[#7047EB] shrink-0" />
          <input
            ref={searchRef}
            type="text"
            autoFocus
            aria-label="Search tools"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 25 utilities by name, LSI keyword, or format (e.g. 20KB, PDF, JSON, JWT, QR)..."
            className="w-full bg-transparent text-sm text-[#171927] dark:text-[#F8F7FC] placeholder-[#64748B] focus:outline-none"
          />
          <button
            onClick={onClose}
            aria-label="Close launcher"
            className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg text-[#64748B] hover:text-[#171927] dark:hover:text-white hover:bg-[#F8F7FC] dark:hover:bg-[#252A3F]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Instant Hub & Favorites Filter Bar */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#F8F7FC] dark:bg-[#151824] border-b border-[#E8E6F2] dark:border-[#2A2E42] overflow-x-auto">
          <button
            type="button"
            onClick={() => setSelectedHubFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedHubFilter === 'all'
                ? 'bg-[#7047EB] text-white'
                : 'text-[#64748B] hover:text-[#171927] dark:hover:text-white'
            }`}
          >
            All ({TOOLS_CATALOG.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedHubFilter('favorites')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedHubFilter === 'favorites'
                ? 'bg-[#7047EB] text-white'
                : 'text-[#64748B] hover:text-[#171927] dark:hover:text-white'
            }`}
          >
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>Pinned ({favoriteIds.length})</span>
          </button>
          {HUBS.map((hub) => (
            <button
              key={hub.id}
              type="button"
              onClick={() => setSelectedHubFilter(hub.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedHubFilter === hub.id
                  ? 'bg-[#7047EB] text-white'
                  : 'text-[#64748B] hover:text-[#171927] dark:hover:text-white'
              }`}
            >
              {hub.shortTitle}
            </button>
          ))}
        </div>

        <div className="max-h-[400px] overflow-y-auto p-3 space-y-4">
          {!q && selectedHubFilter === 'all' && (
            <div>
              <div className="px-3 py-1 text-xs font-semibold text-[#64748B]">
                Topical Category Hubs (5)
              </div>
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
              {filteredTools.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#64748B]">
                  {selectedHubFilter === 'favorites'
                    ? 'No pinned tools yet. Click the star icon next to any utility to pin it for instant access.'
                    : `No utilities matched "${query}". Try searching by format (PDF, WebP, JSON, CSV, SVG).`}
                </div>
              ) : (
                filteredTools.map((tool) => {
                  const hub = HUBS.find((h) => h.id === tool.hubId);
                  const isFav = favoriteIds.includes(tool.id);
                  return (
                    <div
                      key={tool.id}
                      className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F8F7FC] dark:hover:bg-[#252A3F] text-left transition-colors group"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onSelectTool(tool.id);
                          onClose();
                        }}
                        className="flex-1 min-w-0 text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#171927] dark:text-[#F8F7FC] group-hover:text-[#7047EB] transition-colors">
                            {tool.name}
                          </span>
                          <span className="text-xs text-[#64748B]">· {hub?.shortTitle}</span>
                        </div>
                        <p className="text-xs text-[#64748B] truncate">{tool.shortDesc}</p>
                      </button>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="hidden sm:inline px-2 py-0.5 rounded-md bg-[#F8F7FC] dark:bg-[#1C1F2E] text-xs font-medium text-[#64748B] group-hover:text-[#7047EB]">
                          {tool.subCategory}
                        </span>
                        {onToggleFavorite && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite(tool.id);
                            }}
                            aria-label={isFav ? `Unpin ${tool.name}` : `Pin ${tool.name}`}
                            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#1C1F2E] text-[#64748B] hover:text-amber-500 transition-colors"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                isFav ? 'fill-amber-400 text-amber-400' : ''
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-3 bg-[#F8F7FC] dark:bg-[#151824] border-t border-[#E8E6F2] dark:border-[#2A2E42] text-xs text-[#64748B]">
          <span>NextGenToolkit · 25 Free Browser Utilities</span>
          <span>Press Esc to close</span>
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
    'What are the latest Core Web Vitals LCP/INP benchmarks, LSI semantic indexing strategies, and Google Search Console sitemap best practices?'
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
      setErrorMsg(
        'AI Search requires the optional server API and is not available in this static hosting build. All 25 browser-based utility tools remain 100% available.'
      );
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-label="NextGenToolkit AI Search Grounding and High-Thinking Studio"
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
                NextGenToolkit Hybrid AI Workflow & Search Grounding Studio
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
                  'What are the latest Core Web Vitals LCP/INP benchmarks, LSI semantic indexing strategies, and Google Search Console sitemap best practices?'
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
