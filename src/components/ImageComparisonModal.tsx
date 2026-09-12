import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ImageItem } from '../types';
import { formatBytes, formatReduction } from '../utils/formatters';
import {
  X,
  ZoomIn,
  ZoomOut,
  Download,
  ArrowLeftRight,
  Columns2,
  Sparkles,
  Grid,
  RefreshCw,
  Eye,
  Check,
  Loader2,
  AlertCircle,
  Maximize2,
} from 'lucide-react';

interface ImageComparisonModalProps {
  item: ImageItem | null;
  onClose: () => void;
  onDownload: (item: ImageItem) => void;
}

type ViewMode = 'slider' | 'side-by-side' | 'toggle';

export const ImageComparisonModal: React.FC<ImageComparisonModalProps> = ({
  item,
  onClose,
  onDownload,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('slider');
  const [sliderPosition, setSliderPosition] = useState(50); // 0 to 100
  const [isDragging, setIsDragging] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showCheckerboard, setShowCheckerboard] = useState(true);
  const [toggleState, setToggleState] = useState<'compressed' | 'original'>('compressed');

  const [previewSrc, setPreviewSrc] = useState<string>('');
  const [compressedSrc, setCompressedSrc] = useState<string>('');

  const stageRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);

  // Sync image source URLs and handle fallback safety
  useEffect(() => {
    if (!item) {
      setPreviewSrc('');
      setCompressedSrc('');
      return;
    }

    // Set preview source
    if (item.previewUrl) {
      setPreviewSrc(item.previewUrl);
    } else if (item.file) {
      const url = URL.createObjectURL(item.file);
      setPreviewSrc(url);
    }

    // Set compressed source
    if (item.compressedUrl) {
      setCompressedSrc(item.compressedUrl);
    } else if (item.compressedBlob) {
      const url = URL.createObjectURL(item.compressedBlob);
      setCompressedSrc(url);
    }
  }, [item?.id, item?.previewUrl, item?.compressedUrl, item?.compressedBlob, item?.file]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        setToggleState((prev) => (prev === 'compressed' ? 'original' : 'compressed'));
      } else if (e.key === '1') {
        setViewMode('slider');
      } else if (e.key === '2') {
        setViewMode('side-by-side');
      } else if (e.key === '3') {
        setViewMode('toggle');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Compute slider position relative to the image stage or image bounding box
  const updateSliderPos = useCallback((clientX: number) => {
    const targetEl = imageWrapperRef.current || stageRef.current;
    if (!targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  }, []);

  // Global mouse / touch drag handling so drag never drops or freezes
  useEffect(() => {
    if (!isDragging) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      updateSliderPos(e.clientX);
    };

    const handleWindowTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updateSliderPos(e.touches[0].clientX);
      }
    };

    const handleWindowEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowEnd);
    window.addEventListener('touchmove', handleWindowTouchMove, { passive: false });
    window.addEventListener('touchend', handleWindowEnd);
    window.addEventListener('touchcancel', handleWindowEnd);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowEnd);
      window.removeEventListener('touchmove', handleWindowTouchMove);
      window.removeEventListener('touchend', handleWindowEnd);
      window.removeEventListener('touchcancel', handleWindowEnd);
    };
  }, [isDragging, updateSliderPos]);

  if (!item) return null;

  const reduction =
    item.compressedSize !== null
      ? formatReduction(item.originalSize, item.compressedSize)
      : null;

  const isCompressing = item.status === 'compressing' || (!compressedSrc && !item.compressedBlob);

  return (
    <div
      id="image-comparison-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/70 dark:bg-black/85 backdrop-blur-md animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="image-comparison-modal-card"
        className="relative w-full max-w-6xl h-[92vh] max-h-[900px] bg-white border border-zinc-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-900 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100 material:bg-[#FFFDF7] material:border-amber-300 material:text-amber-950"
      >
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-zinc-200 bg-zinc-50/90 dark:border-zinc-800 dark:bg-zinc-900/80 material:border-amber-200 material:bg-amber-100/60 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-red-100 border border-red-200 text-red-600 dark:bg-red-950/60 dark:border-red-900/60 dark:text-red-400 material:bg-amber-300 material:border-amber-400 material:text-amber-950 shrink-0">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white material:text-amber-950 truncate max-w-[200px] sm:max-w-md">
                  {item.name}
                </h3>
                {reduction && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs font-mono font-bold text-red-600 bg-red-100 dark:bg-red-950/70 dark:text-red-400 material:bg-amber-200 material:text-amber-950 px-2 py-0.5 rounded-full border border-red-300 dark:border-red-800 material:border-amber-400">
                    {reduction.percentageText}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 material:text-amber-900/80 truncate">
                Interactive side-by-side quality inspection & artifact comparison
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="inline-flex items-center p-1 rounded-2xl bg-zinc-200/70 dark:bg-zinc-800/80 material:bg-amber-200/60 text-xs font-medium">
              <button
                type="button"
                onClick={() => setViewMode('slider')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  viewMode === 'slider'
                    ? 'bg-white text-zinc-900 shadow-sm font-semibold dark:bg-zinc-950 dark:text-white material:bg-amber-400 material:text-amber-950'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white material:text-amber-900'
                }`}
                title="Split slider view (Press 1)"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Slider</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('side-by-side')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  viewMode === 'side-by-side'
                    ? 'bg-white text-zinc-900 shadow-sm font-semibold dark:bg-zinc-950 dark:text-white material:bg-amber-400 material:text-amber-950'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white material:text-amber-900'
                }`}
                title="Dual side-by-side view (Press 2)"
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Side-by-Side</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('toggle')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  viewMode === 'toggle'
                    ? 'bg-white text-zinc-900 shadow-sm font-semibold dark:bg-zinc-950 dark:text-white material:bg-amber-400 material:text-amber-950'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white material:text-amber-900'
                }`}
                title="Quick A/B toggle view (Press 3 or Space)"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">A/B Flip</span>
              </button>
            </div>

            {/* Quick Export Button */}
            {item.status === 'done' && (
              <button
                type="button"
                onClick={() => onDownload(item)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 text-white hover:bg-red-500 material:bg-amber-400 material:text-amber-950 material:hover:bg-amber-300 text-xs font-semibold shadow-sm transition-all active:scale-95"
                title="Export this image"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/70 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 material:text-amber-800 material:hover:bg-amber-200 transition-colors"
              title="Close modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Compression Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-4 sm:px-6 py-2.5 bg-zinc-50/60 border-b border-zinc-200 dark:bg-zinc-900/40 dark:border-zinc-800/80 material:bg-amber-50/50 material:border-amber-200 text-xs font-mono shrink-0">
          <div className="space-y-0.5">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 material:text-amber-800/70 uppercase block">
              Original Size
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-900 dark:text-zinc-200 material:text-amber-950 font-bold">
                {formatBytes(item.originalSize)}
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                ({item.originalWidth}x{item.originalHeight})
              </span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 material:text-amber-800/70 uppercase block">
              Compressed Size
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-900 dark:text-white material:text-amber-950 font-bold">
                {item.compressedSize !== null ? formatBytes(item.compressedSize) : 'Processing...'}
              </span>
              {item.compressedWidth && item.compressedHeight && (
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  ({item.compressedWidth}x{item.compressedHeight})
                </span>
              )}
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 material:text-amber-800/70 uppercase block">
              Size Reduction
            </span>
            <div className="flex items-center gap-1.5">
              {reduction ? (
                <>
                  <span className="text-red-600 dark:text-red-400 material:text-amber-700 font-extrabold">
                    {reduction.percentageText}
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    (-{reduction.savedText})
                  </span>
                </>
              ) : (
                <span className="text-zinc-400 font-mono">Calculating...</span>
              )}
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 material:text-amber-800/70 uppercase block">
              Format
            </span>
            <div className="flex items-center gap-1.5">
              <span className="uppercase font-bold text-zinc-800 dark:text-zinc-200 material:text-amber-950">
                {item.compressedType ? item.compressedType.replace('image/', '') : item.originalType.replace('image/', '')}
              </span>
              <span className="text-[10px] text-zinc-500 uppercase px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 material:bg-amber-200/80">
                100% Client-side
              </span>
            </div>
          </div>
        </div>

        {/* Main Interactive Stage Area */}
        <div
          ref={stageRef}
          id="comparison-stage-viewport"
          className={`relative flex-1 min-h-[360px] w-full overflow-hidden flex items-center justify-center p-3 sm:p-6 ${
            showCheckerboard
              ? 'bg-checkerboard'
              : 'bg-zinc-100 dark:bg-zinc-900 material:bg-[#F2EDE1]'
          }`}
        >
          {isCompressing ? (
            /* Loading Processing View */
            <div className="flex flex-col items-center justify-center gap-3 p-8 rounded-3xl bg-white/90 border border-zinc-200 shadow-xl dark:bg-zinc-950/90 dark:border-zinc-800 material:bg-[#FFFDF6] material:border-amber-300">
              <Loader2 className="w-8 h-8 animate-spin text-red-500 material:text-amber-500" />
              <div className="text-center space-y-1">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white material:text-amber-950">
                  Optimizing Image...
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 material:text-amber-800/80">
                  Generating high-fidelity compressed preview with target savings
                </p>
              </div>
            </div>
          ) : viewMode === 'slider' ? (
            /* Mode 1: Interactive Draggable Split Slider */
            <div
              ref={imageWrapperRef}
              onMouseDown={(e) => {
                setIsDragging(true);
                updateSliderPos(e.clientX);
              }}
              onTouchStart={(e) => {
                if (e.touches.length > 0) {
                  setIsDragging(true);
                  updateSliderPos(e.touches[0].clientX);
                }
              }}
              className="relative max-w-full max-h-full flex items-center justify-center cursor-ew-resize overflow-hidden rounded-2xl shadow-xl ring-1 ring-zinc-300/80 dark:ring-zinc-800 material:ring-amber-400/40 bg-zinc-900/10"
              style={{
                aspectRatio:
                  item.originalWidth && item.originalHeight
                    ? `${item.originalWidth} / ${item.originalHeight}`
                    : 'auto',
                maxWidth: '100%',
                maxHeight: '100%',
              }}
            >
              {/* Background Layer: Original Image (Shows on Left) */}
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                }}
              >
                <img
                  src={previewSrc || item.previewUrl}
                  alt="Original"
                  className="w-full h-full object-contain pointer-events-none select-none block"
                  referrerPolicy="no-referrer"
                  onError={() => {
                    if (item.file) {
                      setPreviewSrc(URL.createObjectURL(item.file));
                    }
                  }}
                />
              </div>

              {/* Foreground Layer: Compressed Image with Clip Path (Shows on Right) */}
              <div
                className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none overflow-hidden"
                style={{
                  clipPath: `inset(0 0 0 ${sliderPosition}%)`,
                }}
              >
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'center center',
                    transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                  }}
                >
                  <img
                    src={compressedSrc || item.compressedUrl || previewSrc}
                    alt="Compressed"
                    className="w-full h-full object-contain pointer-events-none select-none block"
                    referrerPolicy="no-referrer"
                    onError={() => {
                      if (item.compressedBlob) {
                        setCompressedSrc(URL.createObjectURL(item.compressedBlob));
                      }
                    }}
                  />
                </div>
              </div>

              {/* Floating Quality Indicator Badges */}
              <div className="absolute top-3 left-3 pointer-events-none z-20">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/75 text-white text-[11px] font-mono font-medium shadow-md backdrop-blur-md border border-white/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Original: {formatBytes(item.originalSize)}
                </span>
              </div>

              <div className="absolute top-3 right-3 pointer-events-none z-20">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-600/90 text-white text-[11px] font-mono font-bold shadow-md backdrop-blur-md border border-white/20 material:bg-amber-500 material:text-amber-950">
                  <span className="w-1.5 h-1.5 rounded-full bg-white material:bg-amber-950" />
                  Compressed: {item.compressedSize ? formatBytes(item.compressedSize) : '—'}
                </span>
              </div>

              {/* Draggable Center Divider Bar & Handle */}
              <div
                className="absolute inset-y-0 w-0.5 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)] material:bg-amber-500 material:shadow-[0_0_12px_rgba(245,158,11,0.8)] z-30 pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white border-2 border-red-500 shadow-2xl flex items-center justify-center text-zinc-900 dark:bg-zinc-950 dark:text-white dark:border-red-500 material:bg-amber-400 material:text-amber-950 material:border-amber-600 transition-transform hover:scale-110 active:scale-95">
                  <ArrowLeftRight className="w-4 h-4 text-red-600 dark:text-red-400 material:text-amber-950" />
                </div>
              </div>
            </div>
          ) : viewMode === 'side-by-side' ? (
            /* Mode 2: Synchronized Side-by-Side Dual Panels */
            <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl">
              {/* Left Panel: Original */}
              <div className="relative rounded-2xl bg-zinc-900/10 border border-zinc-300 dark:border-zinc-800 material:border-amber-300/60 overflow-hidden flex flex-col items-center justify-center p-3 shadow-inner">
                <div className="absolute top-3 left-3 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/80 text-white text-xs font-mono font-medium shadow-md backdrop-blur-md border border-white/20">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    Original ({formatBytes(item.originalSize)})
                  </span>
                </div>
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.15s ease-out' }}
                >
                  <img
                    src={previewSrc || item.previewUrl}
                    alt="Original full preview"
                    className="max-w-full max-h-full object-contain rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Right Panel: Compressed */}
              <div className="relative rounded-2xl bg-zinc-900/10 border border-red-400/40 dark:border-red-900/50 material:border-amber-400 overflow-hidden flex flex-col items-center justify-center p-3 shadow-inner">
                <div className="absolute top-3 left-3 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-600/90 text-white text-xs font-mono font-bold shadow-md backdrop-blur-md border border-white/20 material:bg-amber-400 material:text-amber-950">
                    <span className="w-2 h-2 rounded-full bg-white material:bg-amber-950" />
                    Compressed ({item.compressedSize ? formatBytes(item.compressedSize) : '—'})
                  </span>
                </div>
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.15s ease-out' }}
                >
                  <img
                    src={compressedSrc || item.compressedUrl || previewSrc}
                    alt="Compressed full preview"
                    className="max-w-full max-h-full object-contain rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Mode 3: A/B Quick Flip / Hold to Toggle */
            <div className="relative max-w-full max-h-full flex flex-col items-center justify-center gap-3">
              <div
                className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-zinc-300 dark:ring-zinc-800 material:ring-amber-400/50 flex items-center justify-center"
                style={{
                  aspectRatio:
                    item.originalWidth && item.originalHeight
                      ? `${item.originalWidth} / ${item.originalHeight}`
                      : 'auto',
                  maxHeight: '68vh',
                }}
              >
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.15s ease-out' }}
                >
                  <img
                    src={
                      toggleState === 'compressed'
                        ? compressedSrc || item.compressedUrl || previewSrc
                        : previewSrc || item.previewUrl
                    }
                    alt={toggleState === 'compressed' ? 'Compressed view' : 'Original view'}
                    className="w-full h-full object-contain select-none"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="absolute top-3 left-3 z-10">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold shadow-md backdrop-blur-md border border-white/20 ${
                      toggleState === 'compressed'
                        ? 'bg-red-600 text-white material:bg-amber-400 material:text-amber-950'
                        : 'bg-black/80 text-white'
                    }`}
                  >
                    Showing: {toggleState === 'compressed' ? 'Compressed Output' : 'Original Input'}
                  </span>
                </div>
              </div>

              {/* Hold/Toggle Controller */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onMouseDown={() => setToggleState('original')}
                  onMouseUp={() => setToggleState('compressed')}
                  onTouchStart={() => setToggleState('original')}
                  onTouchEnd={() => setToggleState('compressed')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-zinc-900 text-white font-semibold text-xs shadow-lg hover:bg-black active:scale-95 transition-all dark:bg-white dark:text-black dark:hover:bg-zinc-200 material:bg-amber-400 material:text-amber-950 material:hover:bg-amber-300"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Hold down to reveal Original</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setToggleState((prev) => (prev === 'compressed' ? 'original' : 'compressed'))
                  }
                  className="px-4 py-2.5 rounded-2xl bg-zinc-200 border border-zinc-300 text-zinc-800 text-xs font-medium hover:bg-zinc-300 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-700 material:bg-amber-200/80 material:border-amber-300 material:text-amber-950"
                  title="Toggle view (Spacebar)"
                >
                  Flip (Space)
                </button>
              </div>
            </div>
          )}

          {/* Floating Stage Controls (Zoom & Transparency Checkerboard) */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 p-1.5 bg-white/95 border border-zinc-200/90 rounded-2xl shadow-xl backdrop-blur-md z-40 dark:bg-zinc-900/90 dark:border-zinc-800 material:bg-[#FFFDF6]/95 material:border-amber-300 text-xs">
            <button
              type="button"
              onClick={() => setShowCheckerboard((prev) => !prev)}
              className={`p-1.5 rounded-xl transition-colors ${
                showCheckerboard
                  ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-white material:bg-amber-300 material:text-amber-950'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white material:text-amber-800'
              }`}
              title="Toggle transparency checkerboard background"
            >
              <Grid className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 material:bg-amber-200" />

            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}
              className="p-1.5 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 material:text-amber-800 material:hover:bg-amber-100 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className="px-2 py-1 rounded-xl text-zinc-800 dark:text-zinc-200 material:text-amber-950 font-mono font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 material:hover:bg-amber-100 transition-colors"
              title="Reset Zoom to 100%"
            >
              {Math.round(zoomLevel * 100)}%
            </button>

            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
              className="p-1.5 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 material:text-amber-800 material:hover:bg-amber-100 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 border-t border-zinc-200 bg-zinc-50/90 dark:border-zinc-800 dark:bg-zinc-900/80 material:border-amber-200 material:bg-amber-100/60 shrink-0 text-xs">
          <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 material:text-amber-900/80 font-mono text-[11px]">
            <span>Tip: Drag horizontal slider or press 1, 2, 3 to switch modes</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-200/80 hover:bg-zinc-300 border border-zinc-300 text-zinc-800 font-medium dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-700 material:bg-amber-200/80 material:border-amber-300 material:text-amber-950 transition-colors"
            >
              Close
            </button>

            {item.status === 'done' && (
              <button
                type="button"
                onClick={() => onDownload(item)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-500 font-semibold shadow-md active:scale-95 material:bg-amber-400 material:text-amber-950 material:hover:bg-amber-300 material:border material:border-amber-500/40 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Compressed Image</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
