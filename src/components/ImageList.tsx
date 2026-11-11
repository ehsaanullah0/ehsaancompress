import React, { useState, useRef, useCallback } from 'react';
import { ImageItem, ProcessingAction } from '../types';
import { formatBytes, formatReduction } from '../utils/formatters';
import {
  Download,
  Trash2,
  Eye,
  Archive,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Flame,
  FileText,
  ShieldCheck,
  Zap,
  Sparkles,
  Layers,
  ArrowUpRight,
  Sun,
  Grid as GridIcon,
  Moon,
  MoveHorizontal,
} from 'lucide-react';

interface ImageListProps {
  items: ImageItem[];
  activeAction: ProcessingAction;
  onRemove: (id: string) => void;
  onDownload: (item: ImageItem) => void;
  onDownloadAllZip: () => void;
  onClearAll: () => void;
  onInspect: (item: ImageItem) => void;
  onApplyRecommendedSize?: (item: ImageItem, recommendedKb: number) => void;
  onForceStrongCompression?: (item: ImageItem) => void;
  onProcessSingleItem?: (item: ImageItem, action: ProcessingAction) => void;
  isProcessing: boolean;
}

type BackdropType = 'white' | 'checker' | 'dark';

interface InlineImageSliderProps {
  originalUrl: string;
  processedUrl?: string;
  originalName: string;
  isBgModeActive: boolean;
  hasBgRemoved: boolean;
  backdrop: BackdropType;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onInspect: () => void;
}

const InlineImageSlider: React.FC<InlineImageSliderProps> = ({
  originalUrl,
  processedUrl,
  originalName,
  isBgModeActive,
  hasBgRemoved,
  backdrop,
  isLoading,
  isError,
  errorMessage,
  onInspect,
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const backdropClass =
    backdrop === 'white'
      ? 'bg-white'
      : backdrop === 'checker'
      ? 'bg-checkerboard'
      : 'bg-zinc-950';

  const handlePointerMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPos(percentage);
    },
    []
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handlePointerMove(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handlePointerMove(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    if (e.touches[0]) {
      handlePointerMove(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches[0]) {
      handlePointerMove(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const displayProcessedUrl = processedUrl || originalUrl;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full h-72 sm:h-96 rounded-2xl border border-zinc-200 overflow-hidden select-none cursor-ew-resize group/slider ${backdropClass}`}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-30 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3 p-4 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          <p className="text-xs font-semibold font-mono text-zinc-700">
            {isBgModeActive
              ? 'Isolating subject & removing background...'
              : 'Optimizing quality & compressing...'}
          </p>
        </div>
      )}

      {/* Error Overlay */}
      {isError && (
        <div className="absolute inset-0 z-30 bg-red-50/95 flex flex-col items-center justify-center gap-2.5 p-4 text-center">
          <AlertCircle className="w-7 h-7 text-red-600" />
          <p className="text-xs font-semibold text-red-700">
            {errorMessage || 'Processing failed'}
          </p>
        </div>
      )}

      {/* Main Full-Width Image Content */}
      {!isLoading && !isError && (
        <>
          {/* Base Layer (Processed Image - Full width underneath) */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center p-3">
            <img
              src={displayProcessedUrl}
              alt={`Processed ${originalName}`}
              className="w-full h-full object-contain pointer-events-none"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Overlaid Layer (Original Image - Clipped to slider position) */}
          <div
            className="absolute inset-0 w-full h-full flex items-center justify-center p-3 overflow-hidden pointer-events-none"
            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
          >
            <img
              src={originalUrl}
              alt={`Original ${originalName}`}
              className="w-full h-full object-contain pointer-events-none"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Corner Labels */}
          <div className="absolute top-3 left-3 z-20 pointer-events-none">
            <span className="px-2.5 py-1 rounded-full bg-zinc-900/80 backdrop-blur-xs text-[10px] font-mono font-bold text-white shadow-xs tracking-wider uppercase">
              Original ({sliderPos.toFixed(0)}%)
            </span>
          </div>
          <div className="absolute top-3 right-3 z-20 pointer-events-none">
            <span
              className={`px-2.5 py-1 rounded-full backdrop-blur-xs text-[10px] font-mono font-bold text-white shadow-xs tracking-wider uppercase ${
                hasBgRemoved && isBgModeActive ? 'bg-purple-600/90' : 'bg-emerald-600/90'
              }`}
            >
              {hasBgRemoved && isBgModeActive ? 'BG Removed' : 'Processed'} ({(100 - sliderPos).toFixed(0)}%)
            </span>
          </div>

          {/* Interactive Split Divider Line */}
          <div
            className="absolute top-0 bottom-0 z-20 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.5)] pointer-events-none"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-zinc-800 shadow-md border border-zinc-200 flex items-center justify-center group-hover/slider:scale-110 transition-transform">
              <MoveHorizontal className="w-4 h-4 text-zinc-700" />
            </div>
          </div>

          {/* Inspect Fullscreen Overlay Hint */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onInspect();
            }}
            className="absolute bottom-3 left-3 z-20 opacity-80 hover:opacity-100 transition-opacity px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-900 text-white text-[10px] font-medium backdrop-blur-xs flex items-center gap-1 shadow-xs cursor-pointer"
            title="Open side-by-side comparison modal"
          >
            <Eye className="w-3 h-3 text-zinc-300" />
            <span>Expand View</span>
          </button>
        </>
      )}
    </div>
  );
};

export const ImageList: React.FC<ImageListProps> = ({
  items,
  activeAction,
  onRemove,
  onDownload,
  onDownloadAllZip,
  onClearAll,
  onInspect,
  onApplyRecommendedSize,
  onForceStrongCompression,
  onProcessSingleItem,
  isProcessing,
}) => {
  const [backdrop, setBackdrop] = useState<BackdropType>('white');
  const completedCount = items.filter((i) => i.status === 'done').length;

  return (
    <section
      id="processed-output-showcase"
      className="relative w-full rounded-3xl bg-white border border-zinc-200/90 text-zinc-900 p-5 sm:p-7 shadow-sm transition-all space-y-6"
    >
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-800 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Processed Images</span>
              <span className="text-zinc-300">|</span>
              <span>
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {completedCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-mono font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {completedCount} ready
              </span>
            )}

            {isProcessing && (
              <span className="inline-flex items-center gap-1.5 text-xs text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full font-mono font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                Processing...
              </span>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
            Processed Image Showcase
          </h3>
          <p className="text-xs text-zinc-500">
            Drag the split slider directly on any card to compare Original vs. Processed output in real time
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {/* Backdrop switcher */}
          <div className="inline-flex items-center p-0.5 rounded-xl bg-zinc-100 border border-zinc-200 text-xs text-zinc-600">
            <button
              type="button"
              onClick={() => setBackdrop('white')}
              className={`p-1.5 rounded-lg flex items-center gap-1 transition-all ${
                backdrop === 'white'
                  ? 'bg-white text-zinc-900 shadow-xs font-bold'
                  : 'hover:text-zinc-900'
              }`}
              title="White preview canvas"
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">White</span>
            </button>
            <button
              type="button"
              onClick={() => setBackdrop('checker')}
              className={`p-1.5 rounded-lg flex items-center gap-1 transition-all ${
                backdrop === 'checker'
                  ? 'bg-white text-zinc-900 shadow-xs font-bold'
                  : 'hover:text-zinc-900'
              }`}
              title="Transparent checkerboard canvas"
            >
              <GridIcon className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setBackdrop('dark')}
              className={`p-1.5 rounded-lg flex items-center gap-1 transition-all ${
                backdrop === 'dark'
                  ? 'bg-white text-zinc-900 shadow-xs font-bold'
                  : 'hover:text-zinc-900'
              }`}
              title="Dark contrast canvas"
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">Dark</span>
            </button>
          </div>

          {items.length > 1 && completedCount > 0 && (
            <button
              type="button"
              onClick={onDownloadAllZip}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-semibold transition-all shadow-xs active:scale-95"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Download All (ZIP)</span>
            </button>
          )}

          {items.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-600 hover:text-zinc-900 text-xs font-medium transition-colors"
              title="Clear all images"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="py-12 px-4 text-center flex flex-col items-center justify-center gap-3 rounded-2xl bg-zinc-50/70 border border-dashed border-zinc-200">
          <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 text-zinc-400 flex items-center justify-center shadow-xs">
            <Layers className="w-6 h-6 text-zinc-400" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h4 className="text-sm font-semibold text-zinc-800">
              No Processed Images Yet
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Upload photos above and tap either <strong className="text-zinc-800">Compress</strong> to reduce file size or <strong className="text-zinc-800">Remove-BG</strong> to isolate subjects.
            </p>
          </div>
        </div>
      ) : (
        /* Large Full-Width Image Cards Queue */
        <div className="space-y-6">
          {items.map((item) => {
            const hasBgRemoved = Boolean(item.hasBgRemoved && item.bgRemovedUrl);
            const isBgModeActive = item.lastAction === 'remove_bg' || (hasBgRemoved && activeAction === 'remove_bg');
            const processedUrl = isBgModeActive
              ? item.bgRemovedUrl || item.compressedUrl || item.previewUrl
              : item.compressedUrl || item.bgRemovedUrl || item.previewUrl;

            const processedSize = isBgModeActive
              ? item.bgRemovedSize || item.compressedSize || item.originalSize
              : item.compressedSize || item.originalSize;

            const reduction =
              processedSize !== null && item.originalSize > 0
                ? formatReduction(item.originalSize, processedSize)
                : null;

            const assessment = item.qualityAssessment;
            const isTextHeavy = assessment?.isTextHeavy;

            return (
              <div
                key={item.id}
                className="group rounded-3xl bg-zinc-50/60 border border-zinc-200/90 hover:border-zinc-300 p-4 sm:p-5 transition-all shadow-xs hover:shadow-md space-y-4"
              >
                {/* Header Info Bar of Individual Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <h4
                      className="text-base font-bold text-zinc-900 truncate max-w-xs sm:max-w-md"
                      title={item.name}
                    >
                      {item.name}
                    </h4>
                    {isTextHeavy && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full shrink-0">
                        <FileText className="w-3 h-3" />
                        Document
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono flex-wrap">
                    <span className="text-zinc-400">Original:</span>
                    <span className="font-semibold text-zinc-700">{formatBytes(item.originalSize)}</span>
                    <span className="text-zinc-300">•</span>
                    <span>{item.originalWidth}×{item.originalHeight}</span>
                    <span className="text-[10px] uppercase bg-white border border-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded font-mono font-medium">
                      {item.originalType.replace('image/', '')}
                    </span>
                  </div>
                </div>

                {/* Big Full-Width Image Container with Split Slider */}
                <InlineImageSlider
                  originalUrl={item.previewUrl}
                  processedUrl={processedUrl}
                  originalName={item.name}
                  isBgModeActive={isBgModeActive}
                  hasBgRemoved={hasBgRemoved}
                  backdrop={backdrop}
                  isLoading={item.status === 'compressing'}
                  isError={item.status === 'error'}
                  errorMessage={item.error}
                  onInspect={() => onInspect(item)}
                />

                {/* Bottom Bar: Processed Metrics + Interactive Action Controls */}
                <div className="rounded-2xl bg-white border border-zinc-200 p-3.5 sm:px-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                  {/* Left: Metadata Badges & File Savings */}
                  {item.status === 'done' && (
                    <div className="flex items-center gap-3 flex-wrap min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400 font-mono">Result:</span>
                        <span className="text-base font-bold font-mono text-zinc-900">
                          {formatBytes(processedSize)}
                        </span>
                      </div>

                      {reduction && (
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full font-mono ${
                            hasBgRemoved && isBgModeActive
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {hasBgRemoved && isBgModeActive ? (
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          ) : (
                            <Flame className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                          {reduction.percentageText}
                        </span>
                      )}

                      {!isBgModeActive && assessment && (
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${
                            assessment.level === 'low'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : assessment.level === 'moderate'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                          title={`SSIM: ${(assessment.ssim * 100).toFixed(0)}%, Edge Fidelity: ${(assessment.edgePreservation * 100).toFixed(0)}%`}
                        >
                          {assessment.level === 'low' ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          ) : assessment.level === 'moderate' ? (
                            <Zap className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                          )}
                          <span>{assessment.statusLabel}</span>
                        </span>
                      )}

                      <div className="text-xs text-zinc-500 font-mono flex items-center gap-1.5">
                        <span>
                          {(isBgModeActive ? item.bgRemovedWidth : item.compressedWidth) || item.originalWidth}×
                          {(isBgModeActive ? item.bgRemovedHeight : item.compressedHeight) || item.originalHeight}
                        </span>
                        <span className="text-zinc-300">•</span>
                        <span className="uppercase text-zinc-700 font-semibold text-[10px] bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                          {(isBgModeActive ? item.bgRemovedType : item.compressedType)?.replace('image/', '') || 'PNG'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Right: Action Buttons at bottom of card */}
                  <div className="flex items-center gap-2 justify-end flex-wrap shrink-0">
                    {onProcessSingleItem && item.status === 'done' && (
                      <button
                        type="button"
                        onClick={() =>
                          onProcessSingleItem(
                            item,
                            isBgModeActive ? 'compress' : 'remove_bg'
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-semibold transition-colors"
                        title={isBgModeActive ? 'Switch to Compression mode' : 'Remove Background'}
                      >
                        {isBgModeActive ? (
                          <>
                            <Flame className="w-3.5 h-3.5 text-red-500" />
                            <span>Compress</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            <span>Remove BG</span>
                          </>
                        )}
                      </button>
                    )}

                    {item.status === 'done' && (
                      <>
                        <button
                          type="button"
                          onClick={() => onInspect(item)}
                          title="Side-by-side quality comparison modal"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-semibold transition-colors shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Compare</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onDownload(item)}
                          title="Download processed image"
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-semibold transition-all shadow-xs active:scale-95"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export</span>
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      title="Remove image"
                      className="p-1.5 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-zinc-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Quality / Conflict Notice for Compression */}
                {!isBgModeActive && assessment && (assessment.warningTitle || assessment.targetConflict) && (
                  <div className="rounded-2xl p-4 border text-xs space-y-3 transition-all bg-amber-50/90 border-amber-200 text-amber-900">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-1 min-w-0">
                        <h5 className="font-semibold text-amber-950 flex items-center gap-2">
                          {assessment.warningTitle || 'Quality Notice'}
                        </h5>
                        <p className="text-amber-900 leading-relaxed">
                          {assessment.warningMessage}
                        </p>
                      </div>
                    </div>

                    {assessment.targetConflict && assessment.recommendedSizeKb && (
                      <div className="flex items-center gap-2 pt-1 border-t border-amber-200/80 flex-wrap">
                        {onApplyRecommendedSize && (
                          <button
                            type="button"
                            onClick={() => onApplyRecommendedSize(item, assessment.recommendedSizeKb!)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-amber-950 hover:bg-amber-300 text-xs font-bold transition-all shadow-xs active:scale-95"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Keep recommended quality (~{assessment.recommendedSizeKb} KB)</span>
                          </button>
                        )}

                        {onForceStrongCompression && (
                          <button
                            type="button"
                            onClick={() => onForceStrongCompression(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-300 text-xs font-medium transition-colors"
                          >
                            <span>Force strong compression</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onInspect(item)}
                          className="inline-flex items-center gap-1 text-xs text-amber-900 hover:text-amber-950 font-medium underline underline-offset-2 ml-auto"
                        >
                          <span>Inspect details</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
