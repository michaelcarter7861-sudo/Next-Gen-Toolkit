import { ArrowRight, Check, TriangleAlert } from 'lucide-react';

export interface ByteGaugeProps {
  /** Real size of the file the user gave us, in bytes. */
  originalBytes: number;
  /** Real size of the file we produced, in bytes. */
  outputBytes: number;
  /** The ceiling the user asked for, in bytes. Absent for non-ceiling tools. */
  targetBytes?: number;
  /** Measured with the same comparison the download path uses. */
  targetMet?: boolean;
  /** Plain-language outcome, e.g. "Target met", "Best effort". */
  statusLabel: string;
  /** Extra measured facts, e.g. dimensions or page count. */
  details?: string[];
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * A ruler that shows the actual numbers of a compression run.
 *
 * Every value rendered here comes from the engine's measured result object.
 * There are no placeholder or animating numbers: if a value is unknown the
 * gauge says so rather than inventing a plausible figure.
 */
export function ByteGauge({
  originalBytes,
  outputBytes,
  targetBytes,
  targetMet,
  statusLabel,
  details = [],
}: ByteGaugeProps) {
  const domain = Math.max(originalBytes, outputBytes, targetBytes ?? 0, 1);
  const pct = (value: number) => Math.min(100, Math.max(0, (value / domain) * 100));
  const met = targetMet ?? outputBytes <= (targetBytes ?? Number.POSITIVE_INFINITY);
  const savedPct =
    originalBytes > 0
      ? Math.max(0, Math.round(((originalBytes - outputBytes) / originalBytes) * 100))
      : 0;

  const tone = met
    ? 'emerald'
    : outputBytes < originalBytes
      ? 'amber'
      : 'rose';

  const toneClasses = {
    emerald: {
      bar: 'bg-emerald-500',
      chip: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300',
      rule: 'bg-emerald-600',
    },
    amber: {
      bar: 'bg-amber-500',
      chip: 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300',
      rule: 'bg-amber-600',
    },
    rose: {
      bar: 'bg-rose-500',
      chip: 'bg-rose-100 text-rose-900 dark:bg-rose-950/50 dark:text-rose-300',
      rule: 'bg-rose-600',
    },
  }[tone];

  const summary = [
    `Original ${formatBytes(originalBytes)}`,
    targetBytes ? `Target ${formatBytes(targetBytes)}` : null,
    `Result ${formatBytes(outputBytes)}`,
    statusLabel,
    targetMet === false ? 'target not met' : null,
    ...details,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] bg-white dark:bg-[#151824] p-3.5 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#64748B] dark:text-[#94A3B8]">
          <span>Measured output</span>
          {met ? (
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          ) : (
            <TriangleAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          )}
        </div>
        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${toneClasses.chip}`}>
          {statusLabel}
        </span>
      </div>

      {/* The ruler. Decorative duplication of the text row below, so it is hidden from AT. */}
      <div
        role="img"
        aria-label={summary}
        className="relative h-2.5 rounded-full bg-[#EEF0F6] dark:bg-[#232839] overflow-hidden"
      >
        <div className={`h-full ${toneClasses.bar}`} style={{ width: `${pct(outputBytes)}%` }} />
        {typeof targetBytes === 'number' && targetBytes > 0 && targetBytes < domain && (
          <div
            className={`absolute top-0 bottom-0 w-0.5 ${toneClasses.rule}`}
            style={{ left: `${pct(targetBytes)}%` }}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold tabular-nums text-[#334155] dark:text-[#CBD5E1]">
        <span>
          Original <strong>{formatBytes(originalBytes)}</strong>
        </span>
        <ArrowRight className="w-3 h-3 text-[#94A3B8]" aria-hidden="true" />
        {typeof targetBytes === 'number' && (
          <>
            <span>
              Target <strong>{formatBytes(targetBytes)}</strong>
            </span>
            <ArrowRight className="w-3 h-3 text-[#94A3B8]" aria-hidden="true" />
          </>
        )}
        <span>
          Result <strong>{formatBytes(outputBytes)}</strong>
        </span>
        <span className="text-[#64748B] dark:text-[#94A3B8]">
          {savedPct > 0 ? `${savedPct}% smaller` : 'no size change'}
        </span>
      </div>

      {details.length > 0 && (
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
          {details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
