import React from 'react';
import { ProcessingAction } from '../types';
import { Flame, Sparkles, Loader2, Check } from 'lucide-react';

interface PrimaryActionSwitchProps {
  activeAction: ProcessingAction;
  onSelectAction: (action: ProcessingAction) => void;
  isProcessing: boolean;
  hasImages: boolean;
  imageCount: number;
}

export const PrimaryActionSwitch: React.FC<PrimaryActionSwitchProps> = ({
  activeAction,
  onSelectAction,
  isProcessing,
  hasImages,
  imageCount,
}) => {
  return (
    <section
      aria-label="Select Processing Mode"
      className="w-full my-0.5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* BUTTON 1: COMPRESS */}
        <button
          type="button"
          onClick={() => onSelectAction('compress')}
          className={`group relative flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border text-left transition-all duration-150 active:scale-[0.99] cursor-pointer shadow-2xs ${
            activeAction === 'compress'
              ? 'bg-red-500 text-white border-red-600 shadow-sm ring-2 ring-red-500/20 dark:bg-red-600 dark:border-red-500 material:bg-amber-500 material:text-amber-950 material:border-amber-600 material:ring-amber-500/25'
              : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-850 material:bg-[#FFFDF7] material:border-amber-200/90 material:text-amber-950 material:hover:bg-amber-100/50'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-inner ${
                activeAction === 'compress'
                  ? 'bg-white/20 text-white material:bg-black/10 material:text-amber-950'
                  : 'bg-red-50 text-red-600 border border-red-200/80 dark:bg-red-950/40 dark:border-red-900 dark:text-red-400 material:bg-amber-100 material:border-amber-300 material:text-amber-800'
              }`}
            >
              <Flame className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-bold tracking-tight">
                  Compress
                </span>
                {activeAction === 'compress' && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9.5px] font-bold uppercase tracking-wider bg-white/25 text-white material:bg-black/15 material:text-amber-950 font-mono">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                    Active
                  </span>
                )}
              </div>
              <p
                className={`text-[11px] sm:text-xs truncate ${
                  activeAction === 'compress'
                    ? 'text-white/90 material:text-amber-950/85 font-medium'
                    : 'text-zinc-500 dark:text-zinc-400 material:text-amber-900/70'
                }`}
              >
                Reduce file size &amp; preserve quality
              </p>
            </div>
          </div>

          {/* Right badge / indicator */}
          <div className="shrink-0 pl-2">
            {isProcessing && activeAction === 'compress' ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/20 text-white material:bg-black/15 material:text-amber-950 text-xs font-semibold font-mono animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Compressing...</span>
              </div>
            ) : hasImages ? (
              <span
                className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-lg ${
                  activeAction === 'compress'
                    ? 'bg-white/20 text-white material:bg-black/10 material:text-amber-950'
                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 material:bg-amber-100 material:text-amber-900'
                }`}
              >
                {imageCount} {imageCount === 1 ? 'img' : 'imgs'}
              </span>
            ) : null}
          </div>
        </button>

        {/* BUTTON 2: REMOVE-BG */}
        <button
          type="button"
          onClick={() => onSelectAction('remove_bg')}
          className={`group relative flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border text-left transition-all duration-150 active:scale-[0.99] cursor-pointer shadow-2xs ${
            activeAction === 'remove_bg'
              ? 'bg-purple-600 text-white border-purple-700 shadow-sm ring-2 ring-purple-600/20 dark:bg-purple-700 dark:border-purple-600 material:bg-amber-400 material:text-amber-950 material:border-amber-500 material:ring-amber-400/25'
              : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-850 material:bg-[#FFFDF7] material:border-amber-200/90 material:text-amber-950 material:hover:bg-amber-100/50'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-inner ${
                activeAction === 'remove_bg'
                  ? 'bg-white/20 text-white material:bg-black/10 material:text-amber-950'
                  : 'bg-purple-50 text-purple-600 border border-purple-200/80 dark:bg-purple-950/40 dark:border-purple-900 dark:text-purple-400 material:bg-amber-100 material:border-amber-300 material:text-amber-800'
              }`}
            >
              <Sparkles className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-bold tracking-tight">
                  Remove-BG
                </span>
                {activeAction === 'remove_bg' && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9.5px] font-bold uppercase tracking-wider bg-white/25 text-white material:bg-black/15 material:text-amber-950 font-mono">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                    Active
                  </span>
                )}
              </div>
              <p
                className={`text-[11px] sm:text-xs truncate ${
                  activeAction === 'remove_bg'
                    ? 'text-white/90 material:text-amber-950/85 font-medium'
                    : 'text-zinc-500 dark:text-zinc-400 material:text-amber-900/70'
                }`}
              >
                100% Client-side AI background isolation
              </p>
            </div>
          </div>

          {/* Right badge / indicator */}
          <div className="shrink-0 pl-2">
            {isProcessing && activeAction === 'remove_bg' ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/20 text-white material:bg-black/15 material:text-amber-950 text-xs font-semibold font-mono animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Isolating...</span>
              </div>
            ) : hasImages ? (
              <span
                className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-lg ${
                  activeAction === 'remove_bg'
                    ? 'bg-white/20 text-white material:bg-black/10 material:text-amber-950'
                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 material:bg-amber-100 material:text-amber-900'
                }`}
              >
                {imageCount} {imageCount === 1 ? 'img' : 'imgs'}
              </span>
            ) : null}
          </div>
        </button>
      </div>
    </section>
  );
};
