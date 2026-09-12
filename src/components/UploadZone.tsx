import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, FolderPlus } from 'lucide-react';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFilesSelected,
  isProcessing,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Handle system clipboard paste (Cmd+V / Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = e.clipboardData.items;
      const imageFiles: File[] = [];

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
        onFilesSelected(imageFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFilesSelected]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = (Array.from(e.dataTransfer.files) as File[]).filter((f) =>
        f.type.startsWith('image/')
      );
      if (files.length > 0) {
        onFilesSelected(files);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = (Array.from(e.target.files) as File[]).filter((f) =>
        f.type.startsWith('image/')
      );
      if (files.length > 0) {
        onFilesSelected(files);
      }
      e.target.value = '';
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/bmp,image/svg+xml"
        onChange={handleFileInput}
        className="hidden"
        id="local-file-input"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer transition-all duration-200 rounded-3xl border-2 border-dashed p-8 text-center flex flex-col items-center justify-center gap-4 ${
          isDragOver
            ? 'border-red-500 bg-red-50/80 dark:bg-red-950/20 material:border-amber-500 material:bg-amber-100/60 scale-[1.005]'
            : 'border-zinc-300 hover:border-zinc-400 bg-white hover:bg-zinc-50/80 shadow-sm dark:border-zinc-800 dark:hover:border-zinc-600 dark:bg-zinc-950/60 dark:hover:bg-zinc-900/40 material:border-amber-300/80 material:hover:border-amber-400 material:bg-[#FFFDF7] material:hover:bg-[#FFFBEB]/70 material:shadow-[0_2px_12px_rgba(245,158,11,0.06)]'
        }`}
      >
        {/* Subtle decorative glowing badge */}
        <div className="w-14 h-14 rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-700 group-hover:scale-105 group-hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:group-hover:border-zinc-700 material:bg-amber-100 material:border-amber-200 material:text-amber-800 material:group-hover:border-amber-300 flex items-center justify-center transition-all duration-300 shadow-sm">
          <UploadCloud className="w-7 h-7 text-zinc-600 group-hover:text-red-600 dark:text-zinc-300 dark:group-hover:text-red-500 material:text-amber-700 material:group-hover:text-amber-900 transition-colors duration-300" />
        </div>

        <div className="space-y-1.5 max-w-md">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white material:text-amber-950 tracking-tight">
            Drop images here, or click to browse
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 material:text-amber-900/80">
            Supports JPEG, PNG, WEBP, AVIF, BMP, and GIF. Direct clipboard paste (`Ctrl+V`) supported.
          </p>
        </div>

        {/* Primary Action Button: "Add Local Images" */}
        <div className="pt-1 flex items-center justify-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-zinc-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200 material:bg-amber-400 material:text-amber-950 material:hover:bg-amber-300 material:border material:border-amber-500/40 material:shadow-md material:shadow-amber-400/20 font-semibold text-sm transition-all shadow-sm active:scale-95 group/btn"
          >
            <FolderPlus className="w-4 h-4 text-red-500 material:text-amber-950 group-hover/btn:scale-110 transition-transform" />
            <span>Add Local Images</span>
          </button>
        </div>
      </div>
    </div>
  );
};
