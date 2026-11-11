import React from 'react';
import { EhsaanLogo } from './EhsaanLogo';
import { Sparkles, Image as ImageIcon, Flame, Github, History, ExternalLink } from 'lucide-react';
import { formatBytes } from '../utils/formatters';

interface HeaderProps {
  totalSavedBytes: number;
  totalImages: number;
  onClearAll?: () => void;
  onOpenChangelog?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalSavedBytes,
  totalImages,
  onClearAll,
  onOpenChangelog,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-black/90 backdrop-blur-md dark:bg-zinc-950/90 dark:border-zinc-800 material:bg-[#231A0F]/95 material:border-amber-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <EhsaanLogo size={36} className="transition-transform duration-300 group-hover:scale-105" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-black material:bg-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white material:text-amber-50 flex items-center gap-1.5">
                Ehsaan <span className="font-light text-zinc-400 material:text-amber-200/70">Compressor</span>
              </h1>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase rounded bg-zinc-900 border border-zinc-800 text-zinc-300 material:bg-amber-950 material:border-amber-500/40 material:text-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 material:bg-amber-400 animate-pulse" />
                Lossless & Lossy
              </span>
            </div>
            <p className="text-xs text-zinc-400 material:text-amber-200/60 hidden sm:block">
              Minimal, fast client-side image compression with exact size controls
            </p>
          </div>
        </div>

        {/* Right Stats, Changelog & GitHub Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          {totalImages > 0 && totalSavedBytes > 0 && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300 material:bg-amber-950/80 material:border-amber-500/30 material:text-amber-200">
              <Flame className="w-3.5 h-3.5 text-red-500 material:text-amber-400" />
              <span>Saved:</span>
              <span className="font-semibold text-white material:text-amber-100 font-mono">{formatBytes(totalSavedBytes)}</span>
            </div>
          )}

          {onOpenChangelog && (
            <button
              type="button"
              onClick={onOpenChangelog}
              title="View Version Changelog"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white material:bg-amber-950/60 material:border-amber-500/30 material:text-amber-200 material:hover:bg-amber-900 transition-colors"
            >
              <History className="w-3.5 h-3.5 text-red-400 material:text-amber-400" />
              <span className="hidden md:inline">Changelog</span>
            </button>
          )}

          <a
            href="https://github.com/ehsaanullah0/ehsaancompress"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub Repository: ehsaancompress"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-medium text-zinc-200 hover:text-white material:bg-amber-400 material:text-amber-950 material:border-amber-500/40 material:hover:bg-amber-300 transition-all shadow-sm active:scale-95"
          >
            <Github className="w-3.5 h-3.5 text-zinc-300 material:text-amber-950" />
            <span className="hidden sm:inline">GitHub</span>
            <ExternalLink className="w-3 h-3 text-zinc-500 material:text-amber-950/70" />
          </a>
        </div>
      </div>
    </header>
  );
};
