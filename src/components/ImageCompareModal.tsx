import React, { useState, useEffect } from 'react';
import { X, Columns2, Download, ShieldCheck } from 'lucide-react';
import { ProcessedFileItem } from '../utils/binaryEngines';

interface ImageCompareModalProps {
  item: ProcessedFileItem | null;
  onClose: () => void;
  onDownload: (item: ProcessedFileItem) => void;
}

export function ImageCompareModal({ item, onClose, onDownload }: ImageCompareModalProps) {
  const [splitPercent, setSplitPercent] = useState(50);

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [item, onClose]);

  if (!item || !item.previewUrl || !item.sourcePreviewUrl) return null;

  const savedPct =
    item.originalSize > item.outputSize
      ? Math.round(((item.originalSize - item.outputSize) / item.originalSize) * 100)
      : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Before and after visual comparison for ${item.name}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-3xl bg-white dark:bg-[#1C1F2E] border border-[#E8E6F2] dark:border-[#2A2E42] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[#E8E6F2] dark:border-[#2A2E42] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#EDE7FF] dark:bg-[#7047EB]/20 text-[#7047EB] flex items-center justify-center shrink-0">
              <Columns2 className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-extrabold text-[#171927] dark:text-white truncate">
                Before &amp; After Quality Inspector: {item.name}
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                Original {(item.originalSize / 1024).toFixed(1)} KB vs Output{' '}
                {(item.outputSize / 1024).toFixed(1)} KB
                {savedPct > 0 ? ` (${savedPct}% smaller)` : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close visual comparison"
            className="p-2 rounded-xl border border-[#E8E6F2] dark:border-[#2A2E42] text-[#64748B] hover:text-[#171927] dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Interactive Split-Screen Viewport */}
          <div className="relative w-full h-[320px] sm:h-[420px] rounded-2xl overflow-hidden border border-[#E8E6F2] dark:border-[#2A2E42] bg-[#131520] select-none">
            {/* Base Layer: Compressed Output (Right Side) */}
            <img
              src={item.previewUrl}
              alt={`Compressed ${item.name}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain pointer-events-none"
            />

            {/* Clipped Overlay Layer: Original Input (Left Side) */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ clipPath: `inset(0 ${100 - splitPercent}% 0 0)` }}
            >
              <img
                src={item.sourcePreviewUrl}
                alt={`Original ${item.name}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Divider Line & Handle */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-[#7047EB] shadow-md pointer-events-none"
              style={{ left: `${splitPercent}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#7047EB] text-white text-[10px] font-bold flex items-center justify-center shadow-lg border-2 border-white">
                ⇄
              </div>
            </div>

            {/* Corner Labels */}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/75 text-white text-xs font-semibold tabular-nums">
              Original · {(item.originalSize / 1024).toFixed(1)} KB
            </div>
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-[#7047EB] text-white text-xs font-semibold tabular-nums">
              Output · {(item.outputSize / 1024).toFixed(1)} KB
            </div>
          </div>

          {/* Slider Control & Download Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
                <label htmlFor="image-split-slider">Drag Split Divider ({splitPercent}%)</label>
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>0 Bytes Uploaded</span>
                </span>
              </div>
              <input
                id="image-split-slider"
                type="range"
                min={0}
                max={100}
                value={splitPercent}
                onChange={(e) => setSplitPercent(Number(e.target.value))}
                className="w-full utilix-slider"
              />
            </div>

            <button
              type="button"
              onClick={() => onDownload(item)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#7047EB] hover:bg-[#5E35D9] text-white text-xs font-bold shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>Download Verified Output</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
