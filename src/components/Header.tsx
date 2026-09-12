import React from 'react';
import { EhsaanLogo } from './EhsaanLogo';
import { Sparkles, Image as ImageIcon, Flame } from 'lucide-react';
import { formatBytes } from '../utils/formatters';

interface HeaderProps {
  totalSavedBytes: number;
  totalImages: number;
  onClearAll?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalSavedBytes,
  totalImages,
  onClearAll,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-black/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <EhsaanLogo size={36} className="transition-transform duration-300 group-hover:scale-105" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white flex items-center gap-1.5">
                Ehsaan <span className="font-light text-zinc-400">Compressor</span>
              </h1>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Lossless & Lossy
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              Minimal, fast client-side image compression with exact size controls
            </p>
          </div>
        </div>

        {/* Right Stats & Quick Info */}
        <div className="flex items-center gap-3">
          {totalImages > 0 && totalSavedBytes > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300">
              <Flame className="w-3.5 h-3.5 text-red-500" />
              <span>Saved:</span>
              <span className="font-semibold text-white font-mono">{formatBytes(totalSavedBytes)}</span>
            </div>
          )}

          <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900/50 px-2.5 py-1 rounded border border-zinc-800/60">
            <Sparkles className="w-3 h-3 text-red-400" />
            <span>100% In-Browser Privacy</span>
          </div>
        </div>
      </div>
    </header>
  );
};
