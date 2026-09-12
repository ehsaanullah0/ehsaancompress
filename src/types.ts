export type CompressionMode = 'percentage' | 'target_size' | 'quality';

export type OutputFormat = 'original' | 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif';

export interface CompressionSettings {
  mode: CompressionMode;
  reducePercentage: number; // 5% to 95%
  targetSizeKb: number; // e.g. 200 KB
  quality: number; // 10 to 100
  format: OutputFormat;
  maxDimension: number; // 0 = no limit, or 3840, 2560, 1920, 1280, 800
  stripMetadata: boolean;
}

export interface ImageItem {
  id: string;
  file: File;
  name: string;
  originalSize: number; // in bytes
  originalWidth: number;
  originalHeight: number;
  originalType: string;
  previewUrl: string;
  
  // Compression results
  compressedBlob: Blob | null;
  compressedUrl: string | null;
  compressedSize: number | null;
  compressedWidth: number | null;
  compressedHeight: number | null;
  compressedType: string | null;
  
  status: 'idle' | 'compressing' | 'done' | 'error';
  progress: number;
  error?: string;
}

export interface CompressionStats {
  totalOriginalBytes: number;
  totalCompressedBytes: number;
  savedBytes: number;
  savedPercentage: number;
  count: number;
}
