import React, { useId } from 'react';
import { CompressionSettings, CompressionMode, OutputFormat } from '../types';
import { Sliders, FileType, Maximize2, Zap, HelpCircle, Flame } from 'lucide-react';

interface CompressionControlsProps {
  settings: CompressionSettings;
  onChange: (settings: CompressionSettings) => void;
  isProcessing: boolean;
  disabled: boolean;
  hasImages: boolean;
  referenceFileSizeKb?: number;
}

export const CompressionControls: React.FC<CompressionControlsProps> = ({
  settings,
  onChange,
  isProcessing,
  disabled,
  hasImages,
  referenceFileSizeKb,
}) => {
  const percentageSliderId = useId();
  const targetSizeSliderId = useId();
  const qualitySliderId = useId();
  const customInputRef = React.useRef<HTMLInputElement>(null);

  // Compute adaptive bounds based on uploaded image size
  const sliderMax = referenceFileSizeKb && referenceFileSizeKb > 10 ? referenceFileSizeKb : 500;
  const sliderMin = Math.max(5, Math.min(20, Math.round(sliderMax * 0.05)));
  const sliderStep = sliderMax > 500 ? 10 : sliderMax > 100 ? 5 : 1;

  const clampedTargetKb = Math.min(sliderMax, Math.max(sliderMin, settings.targetSizeKb));
  const sliderFillPercent = Math.min(
    100,
    Math.max(0, ((clampedTargetKb - sliderMin) / (sliderMax - sliderMin)) * 100)
  );

  // Adaptive presets matching user's request (e.g. if 250kb -> 200kb, 100kb, 50kb or custom)
  const adaptivePresets = referenceFileSizeKb
    ? [
        {
          label: `${Math.round(referenceFileSizeKb * 0.8)} KB (-20%)`,
          val: Math.round(referenceFileSizeKb * 0.8),
        },
        {
          label: `${Math.round(referenceFileSizeKb * 0.5)} KB (-50%)`,
          val: Math.round(referenceFileSizeKb * 0.5),
        },
        {
          label: `${Math.round(referenceFileSizeKb * 0.25)} KB (-75%)`,
          val: Math.round(referenceFileSizeKb * 0.25),
        },
        {
          label: `${Math.max(5, Math.round(referenceFileSizeKb * 0.1))} KB (-90%)`,
          val: Math.max(5, Math.round(referenceFileSizeKb * 0.1)),
        },
      ]
    : [
        { label: '50 KB', val: 50 },
        { label: '100 KB', val: 100 },
        { label: '200 KB', val: 200 },
        { label: '500 KB', val: 500 },
      ];

  const handleModeChange = (mode: CompressionMode) => {
    onChange({ ...settings, mode });
  };

  const handleFormatChange = (format: OutputFormat) => {
    onChange({ ...settings, format });
  };

  const handlePercentageChange = (value: number) => {
    onChange({ ...settings, reducePercentage: value });
  };

  const handleTargetSizeChange = (value: number) => {
    onChange({ ...settings, targetSizeKb: Math.max(10, value) });
  };

  const handleQualityChange = (value: number) => {
    onChange({ ...settings, quality: value });
  };

  const handleMaxDimensionChange = (dimension: number) => {
    onChange({ ...settings, maxDimension: dimension });
  };

  return (
    <div className="w-full bg-white border border-zinc-200/90 rounded-3xl p-5 sm:p-6 shadow-sm text-zinc-800 dark:bg-zinc-950 dark:border-zinc-800 dark:shadow-2xl dark:text-zinc-200 material:bg-[#FFFDF7] material:border-amber-200/90 material:text-amber-950 material:shadow-[0_4px_24px_rgba(245,158,11,0.06)]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80 material:border-amber-200/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 material:bg-amber-100 material:border-amber-200 material:text-amber-800">
            <Sliders className="w-4 h-4 text-red-500 material:text-amber-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white material:text-amber-950 tracking-tight flex items-center gap-2">
              Compression Engine Settings
              {isProcessing && (
                <span className="flex items-center gap-1 text-[11px] font-normal text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/40 material:text-amber-900 material:bg-amber-100 material:border-amber-300 px-2 py-0.5 rounded-full border dark:border-red-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 material:bg-amber-500 animate-ping" />
                  Compressing...
                </span>
              )}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 material:text-amber-900/80">
              Set target reduction ratio and output format
            </p>
          </div>
        </div>

        {/* Compression Mode Switcher */}
        <div className="inline-flex p-1 rounded-2xl bg-zinc-100 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 material:bg-amber-100/70 material:border-amber-200/90 text-xs">
          <button
            type="button"
            onClick={() => handleModeChange('percentage')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              settings.mode === 'percentage'
                ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/80 font-semibold dark:bg-zinc-800 dark:text-white dark:border-transparent dark:ring-1 dark:ring-zinc-700/50 material:bg-amber-400 material:text-amber-950 material:border-amber-500/40 material:font-bold'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 material:text-amber-900/70 material:hover:text-amber-950'
            }`}
          >
            Percentage Reduction
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('target_size')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              settings.mode === 'target_size'
                ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/80 font-semibold dark:bg-zinc-800 dark:text-white dark:border-transparent dark:ring-1 dark:ring-zinc-700/50 material:bg-amber-400 material:text-amber-950 material:border-amber-500/40 material:font-bold'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 material:text-amber-900/70 material:hover:text-amber-950'
            }`}
          >
            Exact Target Size
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('quality')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              settings.mode === 'quality'
                ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/80 font-semibold dark:bg-zinc-800 dark:text-white dark:border-transparent dark:ring-1 dark:ring-zinc-700/50 material:bg-amber-400 material:text-amber-950 material:border-amber-500/40 material:font-bold'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 material:text-amber-900/70 material:hover:text-amber-950'
            }`}
          >
            Visual Quality
          </button>
        </div>
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
        {/* Left / Center: Size Reduction Slider */}
        <div className="lg:col-span-7 space-y-4">
          {/* Mode 1: Percentage Reduction */}
          {settings.mode === 'percentage' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={percentageSliderId}
                  className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5"
                >
                  <Flame className="w-3.5 h-3.5 text-red-500" />
                  Target Size Reduction
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Reduce by:</span>
                  <span className="font-mono text-base font-bold bg-zinc-100 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 px-2.5 py-0.5 rounded-md text-red-600 dark:text-red-400">
                    {settings.reducePercentage}%
                  </span>
                </div>
              </div>

              {/* Slider Input with Custom Styling */}
              <div className="relative py-2">
                <input
                  id={percentageSliderId}
                  type="range"
                  min="5"
                  max="95"
                  step="1"
                  value={settings.reducePercentage}
                  onChange={(e) => handlePercentageChange(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 material:bg-amber-100 rounded-lg appearance-none cursor-pointer accent-red-500 material:accent-amber-500 focus:outline-none focus:ring-1 focus:ring-red-500/50 material:focus:ring-amber-400/50"
                  style={{
                    background: `linear-gradient(to right, var(--slider-fill, #ef4444) 0%, var(--slider-fill, #ef4444) ${settings.reducePercentage}%, var(--slider-track, #e4e4e7) ${settings.reducePercentage}%, var(--slider-track, #e4e4e7) 100%)`,
                  }}
                />
                <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400 material:text-amber-800/70 font-mono mt-2">
                  <span>-5% (Light)</span>
                  <span>-50% (Half size)</span>
                  <span>-75% (Web fast)</span>
                  <span>-95% (Extreme)</span>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 material:text-amber-800/70">Presets:</span>
                {[
                  { label: 'Minimal (30%)', val: 30 },
                  { label: 'Balanced (60%)', val: 60 },
                  { label: 'Aggressive (80%)', val: 80 },
                  { label: 'Ultra (90%)', val: 90 },
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => handlePercentageChange(preset.val)}
                    className={`text-xs px-2.5 py-1 rounded-xl border transition-all ${
                      settings.reducePercentage === preset.val
                        ? 'border-red-500 bg-red-50 text-red-700 font-semibold dark:border-red-500/60 dark:bg-red-950/30 dark:text-white material:border-amber-500 material:bg-amber-100 material:text-amber-950 material:font-bold'
                        : 'border-zinc-200 bg-zinc-100/80 text-zinc-700 hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:text-white material:border-amber-200/80 material:bg-amber-50/60 material:text-amber-900 material:hover:bg-amber-100/80'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mode 2: Exact Target Size (KB) */}
          {settings.mode === 'target_size' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor={targetSizeSliderId}
                    className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 material:text-amber-950 flex items-center gap-1.5"
                  >
                    <Flame className="w-3.5 h-3.5 text-red-500 material:text-amber-600" />
                    Target Exact File Size
                  </label>
                  {referenceFileSizeKb && (
                    <span className="text-[10px] font-mono text-zinc-600 bg-zinc-100 border border-zinc-200 dark:text-zinc-400 dark:bg-zinc-900 dark:border-zinc-800 material:bg-amber-100 material:border-amber-300/80 material:text-amber-900 px-2 py-0.5 rounded-lg">
                      Original: <strong className="text-zinc-900 dark:text-zinc-200 material:text-amber-950">{referenceFileSizeKb} KB</strong>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 material:text-amber-800/70">Exact Cap:</span>
                  <div className="flex items-center bg-zinc-100 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 material:bg-[#FFFDF7] material:border-amber-300 rounded-xl overflow-hidden focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 material:focus-within:border-amber-500 material:focus-within:ring-amber-400/50">
                    <input
                      ref={customInputRef}
                      type="number"
                      min={sliderMin}
                      max={sliderMax * 2}
                      value={settings.targetSizeKb}
                      onChange={(e) => handleTargetSizeChange(Number(e.target.value))}
                      className="w-20 px-2 py-0.5 text-sm font-mono font-bold text-zinc-900 dark:text-white material:text-amber-950 bg-transparent text-right focus:outline-none focus:text-red-600 dark:focus:text-red-400 material:focus:text-amber-950"
                      title="Enter custom exact size in KB"
                    />
                    <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 material:text-amber-800/70 pr-2">KB</span>
                  </div>
                </div>
              </div>

              {/* Slider for exact target size - scaled adaptively to uploaded image size */}
              <div className="relative py-2">
                <input
                  id={targetSizeSliderId}
                  type="range"
                  min={sliderMin}
                  max={sliderMax}
                  step={sliderStep}
                  value={clampedTargetKb}
                  onChange={(e) => handleTargetSizeChange(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 material:bg-amber-100 rounded-lg appearance-none cursor-pointer accent-red-500 material:accent-amber-500 focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, var(--slider-fill, #ef4444) 0%, var(--slider-fill, #ef4444) ${sliderFillPercent}%, var(--slider-track, #e4e4e7) ${sliderFillPercent}%, var(--slider-track, #e4e4e7) 100%)`,
                  }}
                />
                <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400 material:text-amber-800/70 font-mono mt-2">
                  <span>{sliderMin} KB</span>
                  <span>{Math.round(sliderMin + (sliderMax - sliderMin) * 0.33)} KB</span>
                  <span>{Math.round(sliderMin + (sliderMax - sliderMin) * 0.66)} KB</span>
                  <span className="text-zinc-800 dark:text-zinc-300 material:text-amber-950 font-semibold">
                    {sliderMax} KB {referenceFileSizeKb ? '(Original)' : ''}
                  </span>
                </div>
              </div>

              {/* Adaptive Target Size Presets & Custom Trigger */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 material:text-amber-800/70">
                  {referenceFileSizeKb ? 'Adaptive Presets:' : 'Common limits:'}
                </span>
                {adaptivePresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleTargetSizeChange(preset.val)}
                    className={`text-xs px-2.5 py-1 rounded-xl border transition-all ${
                      settings.targetSizeKb === preset.val
                        ? 'border-red-500 bg-red-50 text-red-700 font-semibold dark:border-red-500/60 dark:bg-red-950/30 dark:text-white material:border-amber-500 material:bg-amber-100 material:text-amber-950 material:font-bold'
                        : 'border-zinc-200 bg-zinc-100/80 text-zinc-700 hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:text-white material:border-amber-200/80 material:bg-amber-50/60 material:text-amber-900 material:hover:bg-amber-100/80'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    customInputRef.current?.focus();
                    customInputRef.current?.select();
                  }}
                  className="text-xs px-2.5 py-1 rounded-xl border border-zinc-200 bg-zinc-100/80 text-zinc-700 hover:border-red-500 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:border-red-500/50 dark:hover:text-white material:border-amber-200 material:bg-amber-50/60 material:text-amber-900 material:hover:border-amber-500 transition-all font-mono"
                  title="Click to enter custom exact size in KB"
                >
                  Custom
                </button>
              </div>
            </div>
          )}

          {/* Mode 3: Quality Percentage */}
          {settings.mode === 'quality' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={qualitySliderId}
                  className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 material:text-amber-950 flex items-center gap-1.5"
                >
                  <Flame className="w-3.5 h-3.5 text-red-500 material:text-amber-600" />
                  Encoding Quality
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 material:text-amber-800/70">Quality:</span>
                  <span className="font-mono text-base font-bold bg-zinc-100 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 material:bg-amber-100 material:border-amber-300 px-2.5 py-0.5 rounded-xl text-red-600 dark:text-red-400 material:text-amber-900">
                    {settings.quality}%
                  </span>
                </div>
              </div>

              <div className="relative py-2">
                <input
                  id={qualitySliderId}
                  type="range"
                  min="10"
                  max="100"
                  step="1"
                  value={settings.quality}
                  onChange={(e) => handleQualityChange(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 material:bg-amber-100 rounded-lg appearance-none cursor-pointer accent-red-500 material:accent-amber-500 focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, var(--slider-fill, #ef4444) 0%, var(--slider-fill, #ef4444) ${settings.quality}%, var(--slider-track, #e4e4e7) ${settings.quality}%, var(--slider-track, #e4e4e7) 100%)`,
                  }}
                />
                <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400 material:text-amber-800/70 font-mono mt-2">
                  <span>10% (Maximum compression)</span>
                  <span>50%</span>
                  <span>75% (Sweet spot)</span>
                  <span>100% (Lossless)</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 material:text-amber-800/70">Presets:</span>
                {[
                  { label: 'Low (40%)', val: 40 },
                  { label: 'Medium (65%)', val: 65 },
                  { label: 'High (80%)', val: 80 },
                  { label: 'Ultra (92%)', val: 92 },
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => handleQualityChange(preset.val)}
                    className={`text-xs px-2.5 py-1 rounded-xl border transition-all ${
                      settings.quality === preset.val
                        ? 'border-red-500 bg-red-50 text-red-700 font-semibold dark:border-red-500/60 dark:bg-red-950/30 dark:text-white material:border-amber-500 material:bg-amber-100 material:text-amber-950 material:font-bold'
                        : 'border-zinc-200 bg-zinc-100/80 text-zinc-700 hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:text-white material:border-amber-200/80 material:bg-amber-50/60 material:text-amber-900 material:hover:bg-amber-100/80'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Export Format Selector */}
        <div className="lg:col-span-5 space-y-4 border-t lg:border-t-0 lg:border-l border-zinc-200/80 dark:border-zinc-800/80 material:border-amber-200/80 lg:pl-6 pt-4 lg:pt-0">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 material:text-amber-950 flex items-center gap-1.5">
                <FileType className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 material:text-amber-800" />
                Export Format
              </label>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 material:text-amber-800/70">Convert on export</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'original', name: 'Original', desc: 'Keep file type' },
                { id: 'image/webp', name: 'WEBP', desc: 'Best web size (recommended)' },
                { id: 'image/jpeg', name: 'JPEG', desc: 'Universal compatibility' },
                { id: 'image/png', name: 'PNG', desc: 'Lossless & transparent' },
                { id: 'image/avif', name: 'AVIF', desc: 'Next-gen format' },
              ].map((fmt) => {
                const isSelected = settings.format === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => handleFormatChange(fmt.id as OutputFormat)}
                    className={`text-left p-2.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-red-500 bg-red-50/80 text-zinc-900 ring-1 ring-red-500/50 dark:border-red-500/80 dark:bg-red-950/20 dark:text-white dark:ring-red-500/30 font-medium material:border-amber-500 material:bg-amber-100/90 material:text-amber-950 material:ring-amber-400/50'
                        : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 hover:border-zinc-300 dark:border-zinc-800/90 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-900 material:border-amber-200/80 material:bg-white material:text-amber-900 material:hover:bg-amber-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold font-mono tracking-wide">
                        {fmt.name}
                      </span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 material:bg-amber-500" />
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 material:text-amber-800/70 block mt-0.5 truncate">
                      {fmt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Max Resolution Constraint */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 material:text-amber-950 flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 material:text-amber-800" />
                Max Dimension
              </label>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 material:text-amber-800/70">Scale bounds</span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { label: 'Original', val: 0 },
                { label: '2560px (2K)', val: 2560 },
                { label: '1920px (FHD)', val: 1920 },
                { label: '1280px (HD)', val: 1280 },
                { label: '800px (Web)', val: 800 },
              ].map((dim) => (
                <button
                  key={dim.val}
                  type="button"
                  onClick={() => handleMaxDimensionChange(dim.val)}
                  className={`text-[11px] px-2.5 py-1 rounded-xl border transition-all ${
                    settings.maxDimension === dim.val
                      ? 'border-red-500 bg-red-50 text-red-700 font-semibold dark:border-red-500/60 dark:bg-red-950/30 dark:text-white material:border-amber-500 material:bg-amber-100 material:text-amber-950 material:font-bold'
                      : 'border-zinc-200 bg-zinc-100/70 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:text-zinc-200 material:border-amber-200/80 material:bg-amber-50/60 material:text-amber-900 material:hover:bg-amber-100/80'
                  }`}
                >
                  {dim.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
