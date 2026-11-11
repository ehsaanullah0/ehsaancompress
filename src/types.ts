export type CompressionMode = 'percentage' | 'target_size' | 'quality';

export type OutputFormat = 'original' | 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif';

export type QualityLossLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface QualityAssessment {
  level: QualityLossLevel;
  score: number; // 0 to 100
  ssim: number; // 0 to 1
  edgePreservation: number; // 0 to 1
  isTextHeavy: boolean;
  statusLabel: string; // e.g. "Quality preserved", "Moderate quality loss", "High quality loss detected"
  warningTitle?: string;
  warningMessage?: string;
  recommendedSizeKb?: number;
  targetConflict?: boolean;
  recovered?: boolean;
}

export interface CompressionSettings {
  mode: CompressionMode;
  reducePercentage: number; // 5% to 95%
  targetSizeKb: number; // e.g. 200 KB
  quality: number; // 10 to 100
  format: OutputFormat;
  maxDimension: number; // 0 = no limit, or 3840, 2560, 1920, 1280, 800
  stripMetadata: boolean;
  allowAggressiveQualityLoss?: boolean;
}

export type ProcessingAction = 'compress' | 'remove_bg';

export interface BackgroundSettings {
  outputType: 'transparent' | 'white' | 'color';
  customColor: string;
  smoothness: number;
  modelQuality?: 'auto' | 'fast' | 'precision';
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
  
  // Last performed action
  lastAction?: ProcessingAction;

  // Compression results
  compressedBlob: Blob | null;
  compressedUrl: string | null;
  compressedSize: number | null;
  compressedWidth: number | null;
  compressedHeight: number | null;
  compressedType: string | null;

  // Background removal results
  bgRemovedBlob?: Blob | null;
  bgRemovedUrl?: string | null;
  bgRemovedSize?: number | null;
  bgRemovedWidth?: number | null;
  bgRemovedHeight?: number | null;
  bgRemovedType?: string | null;
  hasBgRemoved?: boolean;
  bgAlgorithm?: 'ai-model' | 'edge-saliency';
  
  // Quality & degradation analysis
  qualityAssessment?: QualityAssessment | null;
  userAcceptedConflict?: boolean;

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
