import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UploadZone } from './components/UploadZone';
import { CompressionControls } from './components/CompressionControls';
import { ImageList } from './components/ImageList';
import { ImageComparisonModal } from './components/ImageComparisonModal';
import { EhsaanLogo } from './components/EhsaanLogo';
import { EhsaanOdooShowcase } from './components/EhsaanOdooShowcase';
import {
  ImageItem,
  CompressionSettings,
  CompressionStats,
} from './types';
import { compressImage, loadImageFromFile } from './utils/compressor';
import {
  formatBytes,
  formatReduction,
  getFormatExtension,
  getCleanBaseName,
} from './utils/formatters';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Flame,
  ShieldCheck,
  Zap,
  Sliders,
  DownloadCloud,
  CheckCircle,
  Trash2,
  Sun,
  Moon,
  Palette,
} from 'lucide-react';

const DEFAULT_SETTINGS: CompressionSettings = {
  mode: 'target_size',
  reducePercentage: 60,
  targetSizeKb: 250,
  quality: 75,
  format: 'original',
  maxDimension: 0,
  stripMetadata: true,
};

export default function App() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [settings, setSettings] = useState<CompressionSettings>(DEFAULT_SETTINGS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inspectItemId, setInspectItemId] = useState<string | null>(null);
  const inspectItem = items.find((it) => it.id === inspectItemId) || null;
  const [showToast, setShowToast] = useState<string | null>(null);

  // Theme state: defaults to 'light' mode, with 'dark' and 'material' (Google Material Expressive Yellow) options
  const [theme, setTheme] = useState<'light' | 'dark' | 'material'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ehsaan_theme');
        if (saved === 'dark' || saved === 'light' || saved === 'material') return saved;
      } catch {
        // Ignore localStorage error
      }
    }
    return 'light'; // Default to light mode
  });

  // Sync theme with html root class
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'material');
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'material') {
      root.classList.add('material');
    }
    try {
      localStorage.setItem('ehsaan_theme', theme);
    } catch {
      // Ignore
    }
  }, [theme]);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeProcessingRef = useRef(false);

  // Trigger brief status toast
  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => {
      setShowToast(null);
    }, 3000);
  };

  // Process a batch of images with given settings
  const processItems = useCallback(
    async (itemsToProcess: ImageItem[], currentSettings: CompressionSettings) => {
      if (itemsToProcess.length === 0 || activeProcessingRef.current) return;

      activeProcessingRef.current = true;
      setIsProcessing(true);

      const updated = [...itemsToProcess];

      for (let i = 0; i < updated.length; i++) {
        const item = updated[i];
        try {
          // Mark item as compressing
          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id ? { ...it, status: 'compressing', progress: 20 } : it
            )
          );

          const result = await compressImage(item.file, currentSettings, (progress) => {
            setItems((prev) =>
              prev.map((it) =>
                it.id === item.id ? { ...it, progress } : it
              )
            );
          });

          // Clean up prior compressed url if present
          if (item.compressedUrl) {
            URL.revokeObjectURL(item.compressedUrl);
          }

          const compressedUrl = URL.createObjectURL(result.blob);

          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? {
                    ...it,
                    compressedBlob: result.blob,
                    compressedUrl,
                    compressedSize: result.blob.size,
                    compressedWidth: result.width,
                    compressedHeight: result.height,
                    compressedType: result.mimeType,
                    status: 'done',
                    progress: 100,
                  }
                : it
            )
          );
        } catch (err: any) {
          console.error('Compression failed for', item.name, err);
          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? {
                    ...it,
                    status: 'error',
                    error: err?.message || 'Failed to compress image',
                  }
                : it
            )
          );
        }
      }

      activeProcessingRef.current = false;
      setIsProcessing(false);
    },
    []
  );

  // Handle new files uploaded
  const handleFilesSelected = async (files: File[]) => {
    const newItems: ImageItem[] = [];

    for (const file of files) {
      try {
        const img = await loadImageFromFile(file);
        const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const previewUrl = URL.createObjectURL(file);

        newItems.push({
          id,
          file,
          name: file.name,
          originalSize: file.size,
          originalWidth: img.naturalWidth || img.width,
          originalHeight: img.naturalHeight || img.height,
          originalType: file.type || 'image/jpeg',
          previewUrl,
          compressedBlob: null,
          compressedUrl: null,
          compressedSize: null,
          compressedWidth: null,
          compressedHeight: null,
          compressedType: null,
          status: 'idle',
          progress: 0,
        });
      } catch (err) {
        console.error('Error loading file', file.name, err);
      }
    }

    if (newItems.length > 0) {
      const primaryFileKb = Math.round(newItems[0].originalSize / 1024);
      let nextSettings = { ...settings };
      // If current targetSizeKb exceeds uploaded image size or this is first upload, adapt target size
      if (settings.targetSizeKb > primaryFileKb || items.length === 0) {
        const adaptiveKb = Math.max(
          10,
          Math.round((primaryFileKb * 0.6) / 5) * 5 || Math.round(primaryFileKb * 0.6)
        );
        nextSettings = { ...settings, targetSizeKb: adaptiveKb };
        setSettings(nextSettings);
      }

      setItems((prev) => [...prev, ...newItems]);
      // Immediately compress new items
      processItems(newItems, nextSettings);
      triggerToast(`Added ${newItems.length} image${newItems.length > 1 ? 's' : ''}`);
    }
  };

  // Re-compress all when settings change (debounced for silky slider interaction)
  const handleSettingsChange = (newSettings: CompressionSettings) => {
    setSettings(newSettings);

    if (items.length === 0) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      processItems(items, newSettings);
    }, 280);
  };

  // Remove single item
  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((it) => it.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
        if (target.compressedUrl) URL.revokeObjectURL(target.compressedUrl);
      }
      return prev.filter((it) => it.id !== id);
    });
    if (inspectItemId === id) {
      setInspectItemId(null);
    }
  };

  // Clear all
  const handleClearAll = () => {
    items.forEach((it) => {
      URL.revokeObjectURL(it.previewUrl);
      if (it.compressedUrl) URL.revokeObjectURL(it.compressedUrl);
    });
    setItems([]);
    setInspectItemId(null);
  };

  // Download individual item
  const handleDownloadItem = (item: ImageItem) => {
    if (!item.compressedBlob || !item.compressedUrl) return;

    const ext = getFormatExtension(item.compressedType || item.originalType, item.name);
    const base = getCleanBaseName(item.name);
    const downloadName = `${base}_compressed.${ext}`;

    const a = document.createElement('a');
    a.href = item.compressedUrl;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.85 },
      colors: ['#ef4444', '#f97316', '#ffffff'],
    });

    triggerToast(`Exported ${downloadName}`);
  };

  // Download all as ZIP
  const handleDownloadAllZip = async () => {
    const readyItems = items.filter((it) => it.compressedBlob);
    if (readyItems.length === 0) return;

    const zip = new JSZip();

    readyItems.forEach((it) => {
      const ext = getFormatExtension(it.compressedType || it.originalType, it.name);
      const base = getCleanBaseName(it.name);
      zip.file(`${base}_compressed.${ext}`, it.compressedBlob!);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);

    const a = document.createElement('a');
    a.href = url;
    a.download = `ehsaan_compressed_${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.8 },
      colors: ['#ef4444', '#f97316', '#ffffff', '#10b981'],
    });

    triggerToast(`Downloaded ${readyItems.length} compressed images in ZIP`);
  };

  // Calculate global summary stats
  const stats: CompressionStats = items.reduce(
    (acc, it) => {
      acc.totalOriginalBytes += it.originalSize;
      if (it.compressedSize !== null) {
        acc.totalCompressedBytes += it.compressedSize;
        acc.count += 1;
      }
      return acc;
    },
    {
      totalOriginalBytes: 0,
      totalCompressedBytes: 0,
      savedBytes: 0,
      savedPercentage: 0,
      count: 0,
    }
  );

  stats.savedBytes = Math.max(0, stats.totalOriginalBytes - stats.totalCompressedBytes);
  stats.savedPercentage =
    stats.totalOriginalBytes > 0
      ? (stats.savedBytes / stats.totalOriginalBytes) * 100
      : 0;

  const referenceFileSizeKb =
    items.length > 0 ? Math.round(items[0].originalSize / 1024) : undefined;

  return (
    <div
      className={`min-h-screen flex flex-col antialiased transition-colors duration-200 ${
        theme === 'material'
          ? 'bg-[#FAF6EC] text-amber-950 selection:bg-amber-400 selection:text-amber-950 material'
          : theme === 'dark'
          ? 'bg-black text-zinc-100 selection:bg-red-500 selection:text-white dark'
          : 'bg-zinc-100/70 text-zinc-900 selection:bg-red-500 selection:text-white'
      }`}
    >
      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Branding & Controls Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <EhsaanLogo size={48} className="shadow-md ring-1 ring-zinc-300 dark:ring-zinc-800 material:ring-amber-300 rounded-full" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white material:text-amber-950">
                    Ehsaan <span className="font-light text-zinc-500 dark:text-zinc-400 material:text-amber-800/80">Compressor</span>
                  </h1>
                  <span className="w-2 h-2 rounded-full bg-red-500 material:bg-amber-500 animate-pulse" />
                  {theme === 'material' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-mono">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      Material Expressive
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 material:text-amber-900/80">
                  Precision client-side compression engine with adaptive exact target size reduction
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Theme Switcher Toggle (Light, Dark, and Google Material Expressive Yellow) */}
            <div
              id="theme-switcher"
              className="inline-flex items-center p-1 rounded-2xl border bg-white border-zinc-200/90 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 material:bg-[#FFFDF5] material:border-amber-300/80 text-xs gap-0.5"
            >
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                  theme === 'light'
                    ? 'bg-zinc-100 text-zinc-900 shadow-sm font-semibold border border-zinc-200/80'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 material:text-amber-900/70 material:hover:text-amber-950'
                }`}
                title="Switch to light mode"
                aria-label="Light mode"
              >
                <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-red-600' : 'text-zinc-400'}`} />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                  theme === 'dark'
                    ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 material:text-amber-900/70 material:hover:text-amber-950'
                }`}
                title="Switch to dark mode"
                aria-label="Dark mode"
              >
                <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-red-400' : 'text-zinc-400'}`} />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('material')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                  theme === 'material'
                    ? 'bg-amber-400 text-amber-950 shadow-sm font-bold border border-amber-500/40 ring-1 ring-amber-400/60'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 material:text-amber-900/70 material:hover:text-amber-950'
                }`}
                title="Switch to Google Material Expressive (Yellow) theme"
                aria-label="Material Yellow mode"
              >
                <Palette className={`w-3.5 h-3.5 ${theme === 'material' ? 'text-amber-950' : 'text-amber-500'}`} />
                <span>Material</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              </button>
            </div>

            {/* Quick Stats Highlights */}
            {items.length > 0 && stats.count > 0 && (
              <div className="flex items-center gap-4 bg-white border border-zinc-200/90 rounded-2xl p-2.5 px-4 shadow-sm dark:bg-zinc-950 dark:border-zinc-800 dark:shadow-xl material:bg-[#FFFDF6] material:border-amber-200/90 material:shadow-[0_2px_12px_rgba(245,158,11,0.08)]">
                <div>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 material:text-amber-800/70 uppercase font-mono block">
                    Total Saved
                  </span>
                  <span className="text-base sm:text-lg font-bold font-mono text-zinc-900 dark:text-white material:text-amber-950 flex items-center gap-1">
                    <Flame className="w-4 h-4 text-red-500 material:text-amber-600" />
                    {formatBytes(stats.savedBytes)}
                  </span>
                </div>
                <div className="h-7 w-px bg-zinc-200 dark:bg-zinc-800 material:bg-amber-200" />
                <div>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 material:text-amber-800/70 uppercase font-mono block">
                    Reduction
                  </span>
                  <span className="text-base sm:text-lg font-bold font-mono text-red-600 dark:text-red-400 material:text-amber-600">
                    -{stats.savedPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="h-7 w-px bg-zinc-200 dark:bg-zinc-800 material:bg-amber-200" />
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 material:text-amber-800/80 material:hover:text-amber-950 transition-colors flex items-center gap-1 font-mono p-1"
                  title="Clear all images"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Upload Zone */}
        <UploadZone
          onFilesSelected={handleFilesSelected}
          isProcessing={isProcessing}
        />

        {/* Compression Engine Controls */}
        <CompressionControls
          settings={settings}
          onChange={handleSettingsChange}
          isProcessing={isProcessing}
          disabled={false}
          hasImages={items.length > 0}
          referenceFileSizeKb={referenceFileSizeKb}
        />

        {/* Image Queue and Compressed Results */}
        <ImageList
          items={items}
          onRemove={handleRemoveItem}
          onDownload={handleDownloadItem}
          onDownloadAllZip={handleDownloadAllZip}
          onClearAll={handleClearAll}
          onInspect={(it) => setInspectItemId(it.id)}
          isCompressing={isProcessing}
        />

        {/* Showcase section for ehsaan.odoo.com */}
        <EhsaanOdooShowcase />

        {/* Trust and Feature Micro-Badges */}
        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-900 material:border-amber-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-zinc-600 dark:text-zinc-400 material:text-amber-900/80">
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-zinc-200/90 shadow-sm dark:bg-zinc-950/60 dark:border-zinc-900 material:bg-[#FFFDF6] material:border-amber-200/90 material:shadow-[0_2px_8px_rgba(245,158,11,0.06)]">
            <ShieldCheck className="w-4 h-4 text-red-500 material:text-amber-600 shrink-0" />
            <span>Files never leave your browser (100% private & secure)</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-zinc-200/90 shadow-sm dark:bg-zinc-950/60 dark:border-zinc-900 material:bg-[#FFFDF6] material:border-amber-200/90 material:shadow-[0_2px_8px_rgba(245,158,11,0.06)]">
            <Zap className="w-4 h-4 text-red-500 material:text-amber-600 shrink-0" />
            <span>Multi-threaded Web Worker and Canvas acceleration</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-zinc-200/90 shadow-sm dark:bg-zinc-950/60 dark:border-zinc-900 material:bg-[#FFFDF6] material:border-amber-200/90 material:shadow-[0_2px_8px_rgba(245,158,11,0.06)]">
            <Flame className="w-4 h-4 text-red-500 material:text-amber-600 shrink-0" />
            <span>Supports WebP, JPEG, PNG, and AVIF exports</span>
          </div>
        </div>
      </main>

      {/* Comparison Modal */}
      <ImageComparisonModal
        item={inspectItem}
        onClose={() => setInspectItemId(null)}
        onDownload={handleDownloadItem}
      />

      {/* Ephemeral Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-700 text-white text-xs font-medium shadow-2xl animate-fade-in material:bg-[#FFFDF5] material:border-amber-400 material:text-amber-950 material:shadow-[0_8px_30px_rgba(245,158,11,0.2)]">
          <CheckCircle className="w-4 h-4 text-red-500 material:text-amber-600" />
          <span>{showToast}</span>
        </div>
      )}
    </div>
  );
}
