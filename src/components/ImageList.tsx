import React from 'react';
import { ImageItem } from '../types';
import { formatBytes, formatReduction } from '../utils/formatters';
import {
  Download,
  Trash2,
  Eye,
  Archive,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Flame,
  ArrowRight,
  Sparkles,
  Layers,
} from 'lucide-react';

interface ImageListProps {
  items: ImageItem[];
  onRemove: (id: string) => void;
  onDownload: (item: ImageItem) => void;
  onDownloadAllZip: () => void;
  onClearAll: () => void;
  onInspect: (item: ImageItem) => void;
  isCompressing: boolean;
}

export const ImageList: React.FC<ImageListProps> = ({
  items,
  onRemove,
  onDownload,
  onDownloadAllZip,
  onClearAll,
  onInspect,
  isCompressing,
}) => {
  const completedCount = items.filter((i) => i.status === 'done').length;

  return (
    <section
      id="processed-output-showcase"
      className="relative overflow-hidden w-full rounded-3xl bg-[#0c0d12] border border-zinc-800 text-white p-5 sm:p-7 shadow-2xl dark:bg-zinc-950 dark:border-zinc-800/90 material:bg-[#231A0F] material:text-amber-50 material:border-amber-500/30 material:shadow-[0_8px_30px_rgba(245,158,11,0.14)] transition-all space-y-5"
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-red-950/20 dark:bg-red-950/20 material:bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-zinc-900/40 dark:bg-zinc-900/40 material:bg-amber-600/10 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

      {/* Showcase Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/90 dark:border-zinc-850 material:border-amber-500/20">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-xs font-medium text-zinc-300 material:bg-amber-950/70 material:border-amber-400/30 material:text-amber-200">
              <span className="w-2 h-2 rounded-full bg-red-500 material:bg-amber-400 animate-pulse" />
              <span>Output Showcase</span>
              <span className="text-zinc-600 material:text-amber-400/40">|</span>
              <span className="font-mono text-zinc-200 material:text-amber-300">
                {items.length} {items.length === 1 ? 'image' : 'images'}
              </span>
            </div>

            {completedCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 material:bg-amber-400/20 material:border-amber-400/40 material:text-amber-300 px-2.5 py-0.5 rounded-full font-mono">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 material:text-amber-400" />
                {completedCount} optimized
              </span>
            )}

            {isCompressing && (
              <span className="inline-flex items-center gap-1.5 text-xs text-red-400 bg-red-950/60 border border-red-800/50 material:bg-amber-400/20 material:border-amber-400/40 material:text-amber-300 px-2.5 py-0.5 rounded-full font-mono">
                <Loader2 className="w-3 h-3 animate-spin text-red-500 material:text-amber-400" />
                Processing...
              </span>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white material:text-amber-50 flex items-center gap-2">
            Processed Image Area <span className="text-xs font-normal text-zinc-400 material:text-amber-300/70">(Output Showcase)</span>
          </h3>
          <p className="text-xs text-zinc-400 material:text-amber-200/70">
            Real-time visual gallery of compressed outputs, side-by-side inspection, and batch downloading
          </p>
        </div>

        {/* Global batch actions */}
        {items.length > 0 && (
          <div className="flex items-center gap-2.5 shrink-0">
            {items.length > 1 && completedCount > 0 && (
              <button
                type="button"
                onClick={onDownloadAllZip}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-500 transition-all shadow-md active:scale-95 material:bg-amber-400 material:text-amber-950 material:hover:bg-amber-300 material:border material:border-amber-500/40 material:shadow-amber-400/20"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Download All (ZIP)</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-300 text-xs hover:text-white hover:border-zinc-600 material:bg-amber-950/60 material:border-amber-400/30 material:text-amber-200 material:hover:bg-amber-900/80 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Queue</span>
            </button>
          </div>
        )}
      </div>

      {/* Empty State when no images are added yet */}
      {items.length === 0 ? (
        <div className="relative z-10 py-10 px-4 text-center flex flex-col items-center justify-center gap-3 rounded-2xl bg-zinc-950/70 border border-dashed border-zinc-800 material:bg-[#1A130A]/60 material:border-amber-500/20">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 material:bg-amber-950/60 material:border-amber-500/30 material:text-amber-400 flex items-center justify-center shadow-inner">
            <Layers className="w-6 h-6 text-red-500/80 material:text-amber-400" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h4 className="text-sm font-semibold text-zinc-200 material:text-amber-100">
              Showcase Awaiting Images
            </h4>
            <p className="text-xs text-zinc-400 material:text-amber-300/70 leading-relaxed">
              Add photos or art above. Compressed results with exact target size savings and side-by-side comparison will populate this showcase area automatically.
            </p>
          </div>
        </div>
      ) : (
        /* Items Queue List */
        <div className="relative z-10 space-y-3">
          {items.map((item) => {
            const reduction =
              item.compressedSize !== null
                ? formatReduction(item.originalSize, item.compressedSize)
                : null;

            return (
              <div
                key={item.id}
                className="group rounded-2xl bg-[#14151a] border border-zinc-800/90 p-3.5 sm:p-4 transition-all hover:border-zinc-700 dark:bg-zinc-900/80 dark:border-zinc-800 material:bg-[#2F2414] material:border-amber-500/25 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 shadow-md"
              >
                {/* Left: Original Image Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-14 h-14 rounded-xl bg-checkerboard border border-zinc-700/80 material:border-amber-400/30 overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
                    <img
                      src={item.previewUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[9px] font-mono text-zinc-300 text-center py-0.5 uppercase tracking-wider">
                      Original
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h4
                      className="text-sm font-semibold text-white material:text-amber-50 truncate max-w-[200px] sm:max-w-xs"
                      title={item.name}
                    >
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400 material:text-amber-200/70 font-mono flex-wrap">
                      <span className="text-zinc-300 material:text-amber-100">{formatBytes(item.originalSize)}</span>
                      <span className="text-zinc-600 material:text-amber-500/40">•</span>
                      <span>{item.originalWidth}x{item.originalHeight}</span>
                      <span className="text-[10px] uppercase bg-zinc-800 border border-zinc-700 text-zinc-300 material:bg-amber-950 material:border-amber-500/40 material:text-amber-200 px-1.5 py-0.2 rounded font-mono">
                        {item.originalType.replace('image/', '')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Center / Right: Processed Image Area (Output Showcase Box with Differentiated Background) */}
                <div className="flex-1 rounded-xl bg-[#1c1d24] border border-zinc-700/80 p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 dark:bg-black/90 dark:border-zinc-800 material:bg-[#1C140A] material:border-amber-400/30 shadow-inner">
                  {item.status === 'compressing' && (
                    <div className="flex items-center gap-2.5 text-xs text-red-400 material:text-amber-300 font-mono py-1">
                      <Loader2 className="w-4 h-4 animate-spin text-red-500 material:text-amber-400" />
                      <span>Optimizing with exact target settings...</span>
                    </div>
                  )}

                  {item.status === 'error' && (
                    <div className="flex items-center gap-2 text-xs text-red-400 material:text-red-300 font-mono py-1">
                      <AlertCircle className="w-4 h-4 text-red-500 material:text-red-400 shrink-0" />
                      <span>{item.error || 'Compression failed'}</span>
                    </div>
                  )}

                  {item.status === 'done' && reduction && (
                    <div className="flex items-center gap-3.5">
                      {/* Compressed Thumbnail */}
                      <div className="relative w-12 h-12 rounded-lg bg-checkerboard border border-zinc-700/80 material:border-amber-400/30 overflow-hidden shrink-0 flex items-center justify-center">
                        <img
                          src={item.compressedUrl || item.previewUrl}
                          alt={`Compressed ${item.name}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-red-600/85 material:bg-amber-500/90 text-[8px] font-mono font-bold text-white material:text-amber-950 text-center py-0.2 uppercase tracking-wider">
                          Ready
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold font-mono text-white material:text-amber-50">
                            {formatBytes(item.compressedSize || 0)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-950/80 border border-red-600/40 text-red-400 material:bg-amber-400/20 material:border-amber-400/50 material:text-amber-300 font-mono">
                            <Flame className="w-3 h-3 text-red-500 material:text-amber-400" />
                            {reduction.percentageText}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400 material:text-amber-300/70 font-mono flex items-center gap-1.5 flex-wrap">
                          <span>{item.compressedWidth}x{item.compressedHeight}</span>
                          <span className="text-zinc-600 material:text-amber-500/40">•</span>
                          <span className="uppercase text-zinc-200 material:text-amber-100 font-semibold text-[10px] bg-zinc-800 material:bg-amber-950 px-1.5 rounded border border-zinc-700 material:border-amber-400/30">
                            {item.compressedType?.replace('image/', '')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions inside Processed Image Area */}
                  <div className="flex items-center gap-2 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-700/60 material:border-amber-500/20">
                    {item.status === 'done' && (
                      <>
                        <button
                          type="button"
                          onClick={() => onInspect(item)}
                          title="Side-by-side quality comparison"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 hover:text-white material:bg-amber-950/80 material:border-amber-400/40 material:text-amber-200 material:hover:bg-amber-900 text-xs font-medium transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-zinc-400 material:text-amber-400" />
                          <span>Compare</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onDownload(item)}
                          title="Download compressed image"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-black hover:bg-zinc-200 material:bg-amber-400 material:text-amber-950 material:hover:bg-amber-300 material:border material:border-amber-500/40 text-xs font-semibold transition-colors shadow-sm active:scale-95"
                        >
                          <Download className="w-3.5 h-3.5 text-red-600 material:text-amber-950" />
                          <span>Export</span>
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      title="Remove from queue"
                      className="p-1.5 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-zinc-800/80 material:text-amber-400/60 material:hover:text-red-400 material:hover:bg-amber-950/60 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
