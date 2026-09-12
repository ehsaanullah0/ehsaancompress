export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatReduction(original: number, compressed: number): {
  percentage: number;
  percentageText: string;
  savedBytes: number;
  savedText: string;
  isSmaller: boolean;
} {
  const diff = original - compressed;
  const isSmaller = diff > 0;
  const percentage = original > 0 ? (diff / original) * 100 : 0;
  
  return {
    percentage: Math.abs(percentage),
    percentageText: isSmaller ? `-${percentage.toFixed(1)}%` : `+${Math.abs(percentage).toFixed(1)}%`,
    savedBytes: Math.abs(diff),
    savedText: formatBytes(Math.abs(diff)),
    isSmaller,
  };
}

export function getFormatExtension(mimeType: string, fallbackName: string): string {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/avif':
      return 'avif';
    default: {
      const match = fallbackName.match(/\.([0-9a-z]+)$/i);
      return match ? match[1] : 'jpg';
    }
  }
}

export function getCleanBaseName(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, '');
}
