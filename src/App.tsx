import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UploadZone } from './components/UploadZone';
import { CompressionControls } from './components/CompressionControls';
import { BackgroundControls } from './components/BackgroundControls';
import { PrimaryActionSwitch } from './components/PrimaryActionSwitch';
import { ImageList } from './components/ImageList';
import { ImageComparisonModal } from './components/ImageComparisonModal';
import { EhsaanLogo } from './components/EhsaanLogo';
import { FooterAndChangelogSection, ChangelogModal } from './components/FooterAndChangelog';
import {
  ImageItem,
  CompressionSettings,
  CompressionStats,
  ProcessingAction,
  BackgroundSettings,
} from './types';
import { compressImage, loadImageFromFile } from './utils/compressor';
import { removeImageBackground } from './utils/backgroundRemoval';
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
  Github,
  History,
  ExternalLink,
} from 'lucide-react';

const DEFAULT_COMPRESSION_SETTINGS: CompressionSettings = {
  mode: 'target_size',
  reducePercentage: 60,
  targetSizeKb: 250,
  quality: 75,
  format: 'original',
  maxDimension: 0,
  stripMetadata: true,
};

const DEFAULT_BG_SETTINGS: BackgroundSettings = {
  outputType: 'transparent',
  customColor: '#FFFFFF',
  smoothness: 3,
  modelQuality: 'fast',
};

export default function App() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [settings, setSettings] = useState<CompressionSettings>(DEFAULT_COMPRESSION_SETTINGS);
  const [bgSettings, setBgSettings] = useState<BackgroundSettings>(DEFAULT_BG_SETTINGS);
  const [activeAction, setActiveAction] = useState<ProcessingAction>('compress');
  const [isProcessing, setIsProcessing] = useState(false);
  const [inspectItemId, setInspectItemId] = useState<string | null>(null);
  const inspectItem = items.find((it) => it.id === inspectItemId) || null;
  const [showToast, setShowToast] = useState<string | null>(null);
  const [showChangelog, setShowChangelog] = useState<boolean>(false);

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

  // Process a batch of images with given compression settings
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
                    lastAction: 'compress',
                    compressedBlob: result.blob,
                    compressedUrl,
                    compressedSize: result.blob.size,
                    compressedWidth: result.width,
                    compressedHeight: result.height,
                    compressedType: result.mimeType,
                    qualityAssessment: result.qualityAssessment,
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

  // Process a batch of images with Background Removal
  const processBgRemoval = useCallback(
    async (itemsToProcess: ImageItem[], currentBgSettings: BackgroundSettings) => {
      if (itemsToProcess.length === 0 || activeProcessingRef.current) return;

      activeProcessingRef.current = true;
      setIsProcessing(true);

      const updated = [...itemsToProcess];

      for (let i = 0; i < updated.length; i++) {
        const item = updated[i];
        try {
          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id ? { ...it, status: 'compressing', progress: 15 } : it
            )
          );

          const result = await removeImageBackground(
            item.file,
            currentBgSettings,
            (progress) => {
              setItems((prev) =>
                prev.map((it) => (it.id === item.id ? { ...it, progress } : it))
              );
            }
          );

          if (item.bgRemovedUrl) {
            URL.revokeObjectURL(item.bgRemovedUrl);
          }

          const bgRemovedUrl = URL.createObjectURL(result.blob);

          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? {
                    ...it,
                    lastAction: 'remove_bg',
                    bgRemovedBlob: result.blob,
                    bgRemovedUrl,
                    bgRemovedSize: result.blob.size,
                    bgRemovedWidth: result.width,
                    bgRemovedHeight: result.height,
                    bgRemovedType: result.mimeType,
                    hasBgRemoved: true,
                    bgAlgorithm: result.algorithm,
                    status: 'done',
                    progress: 100,
                  }
                : it
            )
          );
        } catch (err: any) {
          console.error('Background removal failed for', item.name, err);
          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? {
                    ...it,
                    status: 'error',
                    error: err?.message || 'Failed to isolate background',
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

  // Switch between Compress and Remove-BG
  const handleSelectAction = (action: ProcessingAction) => {
    setActiveAction(action);
    if (items.length === 0) return;

    if (action === 'compress') {
      processItems(items, settings);
      triggerToast('Optimizing images with Compression Engine');
    } else {
      processBgRemoval(items, bgSettings);
      triggerToast('Isolating subjects with Background Removal');
    }
  };

  // Process single item action switch (e.g. user taps "Remove BG" on an individual card)
  const handleProcessSingleItem = (item: ImageItem, action: ProcessingAction) => {
    if (action === 'remove_bg') {
      processBgRemoval([item], bgSettings);
      triggerToast(`Removing background for ${item.name}`);
    } else {
      processItems([item], settings);
      triggerToast(`Compressing ${item.name}`);
    }
  };

  // Handle recommendation applied by user
  const handleApplyRecommendedSize = (item: ImageItem, recommendedKb: number) => {
    const nextSettings = { ...settings, targetSizeKb: recommendedKb };
    setSettings(nextSettings);
    triggerToast(`Adjusted target size to recommended ~${recommendedKb} KB`);
    processItems(items, nextSettings);
  };

  // Handle user override to force strong compression despite high degradation
  const handleForceStrongCompression = async (item: ImageItem) => {
    try {
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: 'compressing', progress: 30 } : it))
      );
      const forcedSettings: CompressionSettings = {
        ...settings,
        allowAggressiveQualityLoss: true,
      };
      const result = await compressImage(item.file, forcedSettings, (progress) => {
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, progress } : it))
        );
      });

      if (item.compressedUrl) {
        URL.revokeObjectURL(item.compressedUrl);
      }
      const compressedUrl = URL.createObjectURL(result.blob);

      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? {
                ...it,
                lastAction: 'compress',
                compressedBlob: result.blob,
                compressedUrl,
                compressedSize: result.blob.size,
                compressedWidth: result.width,
                compressedHeight: result.height,
                compressedType: result.mimeType,
                qualityAssessment: result.qualityAssessment,
                userAcceptedConflict: true,
                status: 'done',
                progress: 100,
              }
            : it
        )
      );
      triggerToast('Applied maximum compression as requested');
    } catch (err: any) {
      console.error('Forced compression failed', err);
    }
  };

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

      // Automatically run active mode
      if (activeAction === 'compress') {
        processItems(newItems, nextSettings);
      } else {
        processBgRemoval(newItems, bgSettings);
      }

      triggerToast(`Added ${newItems.length} image${newItems.length > 1 ? 's' : ''}`);
    }
  };

  // Re-compress all when compression settings change
  const handleSettingsChange = (newSettings: CompressionSettings) => {
    setSettings(newSettings);
    if (items.length === 0 || activeAction !== 'compress') return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      processItems(items, newSettings);
    }, 280);
  };

  // Re-process when background settings change
  const handleBgSettingsChange = (newBgSettings: BackgroundSettings) => {
    setBgSettings(newBgSettings);
    if (items.length === 0 || activeAction !== 'remove_bg') return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      processBgRemoval(items, newBgSettings);
    }, 350);
  };

  // Remove single item
  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((it) => it.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
        if (target.compressedUrl) URL.revokeObjectURL(target.compressedUrl);
        if (target.bgRemovedUrl) URL.revokeObjectURL(target.bgRemovedUrl);
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
      if (it.bgRemovedUrl) URL.revokeObjectURL(it.bgRemovedUrl);
    });
    setItems([]);
    setInspectItemId(null);
  };

  // Download individual item
  const handleDownloadItem = (item: ImageItem) => {
    const isBgActive =
      item.lastAction === 'remove_bg' || (item.hasBgRemoved && activeAction === 'remove_bg');
    const targetBlob = isBgActive
      ? item.bgRemovedBlob || item.compressedBlob
      : item.compressedBlob || item.bgRemovedBlob;
    const targetUrl = isBgActive
      ? item.bgRemovedUrl || item.compressedUrl
      : item.compressedUrl || item.bgRemovedUrl;

    if (!targetBlob || !targetUrl) return;

    const base = getCleanBaseName(item.name);
    const ext = isBgActive
      ? 'png'
      : getFormatExtension(item.compressedType || item.originalType, item.name);
    const downloadName = isBgActive ? `${base}_nobg.${ext}` : `${base}_compressed.${ext}`;

    const a = document.createElement('a');
    a.href = targetUrl;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.85 },
      colors: isBgActive ? ['#9333ea', '#c084fc', '#ffffff'] : ['#ef4444', '#f97316', '#ffffff'],
    });

    triggerToast(`Exported ${downloadName}`);
  };

  // Download all as ZIP
  const handleDownloadAllZip = async () => {
    const readyItems = items.filter((it) => it.status === 'done');
    if (readyItems.length === 0) return;

    const zip = new JSZip();

    readyItems.forEach((it) => {
      const isBg = it.lastAction === 'remove_bg' || (it.hasBgRemoved && activeAction === 'remove_bg');
      const blob = isBg ? it.bgRemovedBlob || it.compressedBlob : it.compressedBlob || it.bgRemovedBlob;
      if (!blob) return;

      const base = getCleanBaseName(it.name);
      const ext = isBg ? 'png' : getFormatExtension(it.compressedType || it.originalType, it.name);
      const filename = isBg ? `${base}_nobg.${ext}` : `${base}_compressed.${ext}`;
      zip.file(filename, blob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);

    const a = document.createElement('a');
    a.href = url;
    a.download = `ehsaan_processed_${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.8 },
      colors: ['#ef4444', '#9333ea', '#ffffff', '#10b981'],
    });

    triggerToast(`Downloaded ${readyItems.length} processed images in ZIP`);
  };

  // Calculate global summary stats
  const stats: CompressionStats = items.reduce(
    (acc, it) => {
      acc.totalOriginalBytes += it.originalSize;
      const targetSize = it.compressedSize ?? it.bgRemovedSize;
      if (targetSize !== null && targetSize !== undefined) {
        acc.totalCompressedBytes += targetSize;
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* Hero Branding & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <EhsaanLogo
                size={52}
                shape="squircle"
                className="shadow-md ring-2 ring-pink-500/30 hover:scale-105 transition-transform"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white material:text-amber-950">
                    Ehsaan{' '}
                    <span className="font-light text-zinc-500 dark:text-zinc-400 material:text-amber-800/80">
                      Studio
                    </span>
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
                  Minimal client-side image compression &amp; AI background removal suite
                </p>
              </div>
            </div>
          </div>

          {/* Theme & Quick Action Links */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Theme switcher */}
            <div className="inline-flex p-1 rounded-2xl bg-white border border-zinc-200/90 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 material:bg-[#FFFDF6] material:border-amber-300/80 text-xs">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                  theme === 'light'
                    ? 'bg-zinc-900 text-white shadow-sm font-semibold material:bg-amber-400 material:text-amber-950'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
                title="Switch to light mode"
                aria-label="Light mode"
              >
                <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-amber-400' : 'text-zinc-400'}`} />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                  theme === 'dark'
                    ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
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
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
                title="Switch to Google Material Expressive (Yellow) theme"
                aria-label="Material Yellow mode"
              >
                <Palette className={`w-3.5 h-3.5 ${theme === 'material' ? 'text-amber-950' : 'text-amber-500'}`} />
                <span>Material</span>
              </button>
            </div>

            {/* Changelog & GitHub Header Quick Links */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowChangelog(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white border border-zinc-200/90 shadow-sm text-xs font-semibold text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:text-white material:bg-[#FFFDF6] material:border-amber-300/80 material:text-amber-950 transition-all active:scale-95"
                title="View Release Changelog"
              >
                <History className="w-3.5 h-3.5 text-red-500 material:text-amber-600" />
                <span className="hidden sm:inline">Changelog</span>
              </button>

              <a
                href="https://github.com/ehsaanullah0/ehsaancompress"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 material:bg-amber-400 material:text-amber-950 text-xs font-bold transition-all shadow-sm active:scale-95"
                title="View GitHub Repository"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            </div>

            {/* Quick Stats Highlights */}
            {items.length > 0 && stats.count > 0 && (
              <div className="flex items-center gap-4 bg-white border border-zinc-200/90 rounded-2xl p-2 px-3.5 shadow-sm dark:bg-zinc-950 dark:border-zinc-800 material:bg-[#FFFDF6] material:border-amber-200/90">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">
                    Saved
                  </span>
                  <span className="text-sm font-bold font-mono text-zinc-900 dark:text-white material:text-amber-950 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-red-500 material:text-amber-600" />
                    {formatBytes(stats.savedBytes)}
                  </span>
                </div>
                <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">
                    Reduction
                  </span>
                  <span className="text-sm font-bold font-mono text-red-600 dark:text-red-400 material:text-amber-600">
                    -{stats.savedPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 1. TOP PRIMARY ACTION BUTTONS: "Compress" & "Remove-BG" (Shifted to top with refined compact size) */}
        <div className="pb-3 sm:pb-5">
          <PrimaryActionSwitch
            activeAction={activeAction}
            onSelectAction={handleSelectAction}
            isProcessing={isProcessing}
            hasImages={items.length > 0}
            imageCount={items.length}
          />
        </div>

        {/* 2. Upload Zone */}
        <UploadZone
          onFilesSelected={handleFilesSelected}
          isProcessing={isProcessing}
        />

        {/* 3. Mode-Specific Controls */}
        {activeAction === 'compress' ? (
          <CompressionControls
            settings={settings}
            onChange={handleSettingsChange}
            isProcessing={isProcessing}
            disabled={false}
            hasImages={items.length > 0}
            referenceFileSizeKb={referenceFileSizeKb}
          />
        ) : (
          <BackgroundControls
            settings={bgSettings}
            onChange={handleBgSettingsChange}
            isProcessing={isProcessing}
            disabled={false}
            hasImages={items.length > 0}
            onApplyAll={() => processBgRemoval(items, bgSettings)}
          />
        )}

        {/* 4. Processed Image Area (Redesigned Minimal & Clean with White Background for Maximum Visibility) */}
        <ImageList
          items={items}
          activeAction={activeAction}
          onRemove={handleRemoveItem}
          onDownload={handleDownloadItem}
          onDownloadAllZip={handleDownloadAllZip}
          onClearAll={handleClearAll}
          onInspect={(it) => setInspectItemId(it.id)}
          onApplyRecommendedSize={handleApplyRecommendedSize}
          onForceStrongCompression={handleForceStrongCompression}
          onProcessSingleItem={handleProcessSingleItem}
          isCompressing={isProcessing}
        />

        {/* 5. Trust and Feature Micro-Badges */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 material:border-amber-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs text-zinc-600 dark:text-zinc-400 material:text-amber-900/80">
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-zinc-200/90 shadow-xs dark:bg-zinc-950/60 dark:border-zinc-800 material:bg-[#FFFDF6] material:border-amber-200/90">
            <ShieldCheck className="w-4 h-4 text-emerald-600 material:text-amber-600 shrink-0" />
            <span>Files never leave browser (100% private client-side)</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-zinc-200/90 shadow-xs dark:bg-zinc-950/60 dark:border-zinc-800 material:bg-[#FFFDF6] material:border-amber-200/90">
            <Zap className="w-4 h-4 text-purple-600 material:text-amber-600 shrink-0" />
            <span>AI Background Cutouts + Adaptive Compression</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-zinc-200/90 shadow-xs dark:bg-zinc-950/60 dark:border-zinc-800 material:bg-[#FFFDF6] material:border-amber-200/90">
            <Flame className="w-4 h-4 text-red-500 material:text-amber-600 shrink-0" />
            <span>Transparent PNG, WebP, JPEG, and AVIF exports</span>
          </div>
        </div>

        {/* 6. GitHub Repository & Detailed Changelog Section */}
        <FooterAndChangelogSection onOpenChangelog={() => setShowChangelog(true)} />
      </main>

      {/* Comparison Modal */}
      <ImageComparisonModal
        item={inspectItem}
        onClose={() => setInspectItemId(null)}
        onDownload={handleDownloadItem}
      />

      {/* Changelog Modal */}
      <ChangelogModal
        isOpen={showChangelog}
        onClose={() => setShowChangelog(false)}
      />

      {/* Ephemeral Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-700 text-white text-xs font-medium shadow-2xl animate-fade-in material:bg-[#FFFDF5] material:border-amber-400 material:text-amber-950">
          <CheckCircle className="w-4 h-4 text-emerald-400 material:text-amber-600" />
          <span>{showToast}</span>
        </div>
      )}
    </div>
  );
}
