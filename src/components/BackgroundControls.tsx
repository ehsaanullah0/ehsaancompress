import React from 'react';
import { BackgroundSettings } from '../types';
import { Sparkles, Sliders, Check } from 'lucide-react';

interface BackgroundControlsProps {
  settings: BackgroundSettings;
  onChange: (settings: BackgroundSettings) => void;
  isProcessing: boolean;
  disabled: boolean;
  hasImages: boolean;
  onApplyAll: () => void;
}

const PRESET_COLORS = [
  { label: 'Crisp White', value: '#FFFFFF', border: 'border-zinc-300' },
  { label: 'Pure Black', value: '#09090B', border: 'border-zinc-800' },
  { label: 'Studio Gray', value: '#F3F4F6', border: 'border-zinc-200' },
  { label: 'Warm Cream', value: '#FFFBEB', border: 'border-amber-200' },
  { label: 'Soft Blue', value: '#EFF6FF', border: 'border-blue-200' },
  { label: 'Slate Dark', value: '#1E293B', border: 'border-slate-700' },
];

export const BackgroundControls: React.FC<BackgroundControlsProps> = ({
  settings,
  onChange,
  isProcessing,
  disabled: _disabled,
  hasImages,
  onApplyAll,
}) => {
  return (
    <div className="w-full bg-white border border-zinc-200/90 rounded-3xl p-5 sm:p-6 shadow-sm text-zinc-800 dark:bg-zinc-950 dark:border-zinc-800 dark:shadow-2xl dark:text-zinc-200 material:bg-[#FFFDF7] material:border-amber-200/90 material:text-amber-950 material:shadow-[0_4px_24px_rgba(245,158,11,0.06)] space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80 material:border-amber-200/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 dark:bg-purple-950/50 dark:border-purple-800/60 dark:text-purple-300 material:bg-amber-100 material:border-amber-200 material:text-amber-800">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white material:text-amber-950 tracking-tight flex items-center gap-2">
              Background Removal Engine
              {isProcessing && (
                <span className="flex items-center gap-1 text-[11px] font-normal text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-300 dark:bg-purple-950/40 px-2 py-0.5 rounded-full border">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
                  Isolating subjects...
                </span>
              )}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 material:text-amber-900/80">
              100% Client-side AI isolation • Transparent PNG, solid white, or custom background
            </p>
          </div>
        </div>

        {/* Output Style Switcher */}
        <div className="inline-flex p-1 rounded-2xl bg-zinc-100 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 material:bg-amber-100/70 material:border-amber-200/90 text-xs">
          <button
            type="button"
            onClick={() => onChange({ ...settings, outputType: 'transparent' })}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              settings.outputType === 'transparent'
                ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/80 font-semibold dark:bg-zinc-800 dark:text-white dark:border-transparent material:bg-amber-400 material:text-amber-950'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
            }`}
          >
            Transparent Alpha
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...settings, outputType: 'white' })}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              settings.outputType === 'white'
                ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/80 font-semibold dark:bg-zinc-800 dark:text-white dark:border-transparent material:bg-amber-400 material:text-amber-950'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
            }`}
          >
            Solid White
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...settings, outputType: 'color' })}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              settings.outputType === 'color'
                ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/80 font-semibold dark:bg-zinc-800 dark:text-white dark:border-transparent material:bg-amber-400 material:text-amber-950'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
            }`}
          >
            Custom Color
          </button>
        </div>
      </div>

      {/* Control Body */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
        {/* Left: Background styling / color options */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 material:text-amber-900 flex items-center justify-between">
            <span>Background Style</span>
            <span className="text-[11px] font-mono text-zinc-400">
              {settings.outputType === 'transparent'
                ? 'Transparent (.png)'
                : settings.outputType === 'white'
                ? '#FFFFFF Pure White'
                : settings.customColor}
            </span>
          </label>

          {settings.outputType === 'transparent' ? (
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/90 dark:bg-zinc-900/60 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
              <div className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-checkerboard border border-zinc-300" />
                Alpha Transparency Cutout
              </div>
              <p className="text-[11px] text-zinc-500">
                Preserves subjects with clean feathered borders. Ideal for e-commerce, logos, portraits, and stickers.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_COLORS.map((c) => {
                  const isSelected = settings.customColor.toLowerCase() === c.value.toLowerCase() || (settings.outputType === 'white' && c.value === '#FFFFFF');
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => {
                        if (c.value === '#FFFFFF') {
                          onChange({ ...settings, outputType: 'white', customColor: '#FFFFFF' });
                        } else {
                          onChange({ ...settings, outputType: 'color', customColor: c.value });
                        }
                      }}
                      className={`relative w-8 h-8 rounded-full border ${c.border} transition-all active:scale-95 flex items-center justify-center shadow-xs ${
                        isSelected ? 'ring-2 ring-purple-600 ring-offset-2' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    >
                      {isSelected && (
                        <Check
                          className={`w-3.5 h-3.5 ${
                            c.value === '#09090B' || c.value === '#1E293B' ? 'text-white' : 'text-zinc-800'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}

                {/* Custom Color Input */}
                <div className="flex items-center gap-1.5 ml-2">
                  <input
                    type="color"
                    value={settings.customColor}
                    onChange={(e) =>
                      onChange({ ...settings, outputType: 'color', customColor: e.target.value })
                    }
                    className="w-7 h-7 rounded-lg cursor-pointer border border-zinc-300 dark:border-zinc-700 bg-transparent p-0"
                    title="Custom color picker"
                  />
                  <span className="text-[11px] font-mono text-zinc-500">
                    {settings.customColor.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Right: Edge Smoothness slider & Engine Optimization */}
        <div className="space-y-3.5">
          {/* AI Model Performance Mode Switcher */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 material:text-amber-900">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <span>Engine Optimization</span>
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                {(settings.modelQuality || 'fast') === 'fast' ? '⚡ Lightweight (Fast)' : '🎯 Deep Precision'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => onChange({ ...settings, modelQuality: 'fast' })}
                className={`py-1.5 px-2.5 rounded-xl border text-center transition-all ${
                  (settings.modelQuality || 'fast') === 'fast'
                    ? 'bg-purple-50 border-purple-300 text-purple-700 dark:bg-purple-950/60 dark:border-purple-700 dark:text-purple-300 font-bold shadow-2xs'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400'
                }`}
                title="Lightweight quantized model: uses 4x less memory, runs fast & crash-proof"
              >
                ⚡ Fast &amp; Smooth (Safe)
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...settings, modelQuality: 'precision' })}
                className={`py-1.5 px-2.5 rounded-xl border text-center transition-all ${
                  settings.modelQuality === 'precision'
                    ? 'bg-purple-50 border-purple-300 text-purple-700 dark:bg-purple-950/60 dark:border-purple-700 dark:text-purple-300 font-bold shadow-2xs'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400'
                }`}
                title="High-definition FP16 model: higher fidelity, requires more browser RAM"
              >
                🎯 Deep Precision
              </button>
            </div>
          </div>

          {/* Edge Feather & Smoothing Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 material:text-amber-900">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-500" />
                <span>Edge Feather & Smoothing</span>
              </span>
              <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                Level {settings.smoothness}
              </span>
            </div>

            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={settings.smoothness}
                onChange={(e) =>
                  onChange({ ...settings, smoothness: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full h-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                <span>Crisp Edge (0)</span>
                <span>Balanced (3-5)</span>
                <span>Ultra Soft (10)</span>
              </div>
            </div>
          </div>


          {hasImages && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onApplyAll}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Re-run Background Removal</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
