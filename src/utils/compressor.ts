import { CompressionSettings } from '../types';

interface CompressionResult {
  blob: Blob;
  width: number;
  height: number;
  mimeType: string;
}

/**
 * Check if the browser supports a specific mime type for canvas.toBlob
 */
export function isFormatSupported(mimeType: string): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  try {
    const dataUrl = canvas.toDataURL(mimeType);
    return dataUrl.startsWith(`data:${mimeType}`);
  } catch {
    return false;
  }
}

/**
 * Load an image file into an HTMLImageElement
 */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${file.name}`));
    };
    
    img.src = url;
  });
}

/**
 * Helper to convert canvas to blob with Promise
 */
function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas conversion to blob failed'));
        }
      },
      mimeType,
      quality
    );
  });
}

/**
 * Calculate scaled dimensions respecting aspect ratio and optional maximum dimension
 */
export function calculateDimensions(
  origWidth: number,
  origHeight: number,
  maxDimension: number,
  scaleMultiplier: number = 1.0
): { width: number; height: number } {
  let width = origWidth * scaleMultiplier;
  let height = origHeight * scaleMultiplier;

  if (maxDimension > 0 && (width > maxDimension || height > maxDimension)) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  return {
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(height)),
  };
}

/**
 * High-performance image compressor
 */
export async function compressImage(
  file: File,
  settings: CompressionSettings,
  onProgress?: (percent: number) => void
): Promise<CompressionResult> {
  onProgress?.(10);
  const img = await loadImageFromFile(file);
  const origWidth = img.naturalWidth || img.width;
  const origHeight = img.naturalHeight || img.height;

  // Determine target MIME type
  let targetMime = settings.format === 'original' ? file.type : settings.format;
  if (!targetMime || !isFormatSupported(targetMime)) {
    // Fallback to webp if supported, else jpeg
    targetMime = isFormatSupported('image/webp') ? 'image/webp' : 'image/jpeg';
  }

  onProgress?.(30);

  // Setup offscreen canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: false });
  if (!ctx) {
    throw new Error('Could not obtain canvas 2D rendering context');
  }

  // Handle Quality Mode directly
  if (settings.mode === 'quality') {
    const dims = calculateDimensions(origWidth, origHeight, settings.maxDimension);
    canvas.width = dims.width;
    canvas.height = dims.height;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // If JPEG/no transparency support, fill white background if transparent
    if (targetMime === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, 0, 0, dims.width, dims.height);
    onProgress?.(70);

    const quality = Math.max(0.05, Math.min(1.0, settings.quality / 100));
    const blob = await canvasToBlob(canvas, targetMime, quality);
    onProgress?.(100);

    return {
      blob,
      width: dims.width,
      height: dims.height,
      mimeType: targetMime,
    };
  }

  // Calculate target bytes for percentage or target_size
  let targetBytes: number;
  if (settings.mode === 'percentage') {
    const factor = Math.max(0.05, (100 - settings.reducePercentage) / 100);
    targetBytes = Math.round(file.size * factor);
  } else {
    targetBytes = Math.max(1024, Math.round(settings.targetSizeKb * 1024));
  }

  // Target size reduction search
  // If target format is PNG, browser doesn't do lossy compression on quality parameter,
  // so we scale dimensions to reach target size if needed.
  if (targetMime === 'image/png') {
    let scale = 1.0;
    let dims = calculateDimensions(origWidth, origHeight, settings.maxDimension, scale);
    canvas.width = dims.width;
    canvas.height = dims.height;
    ctx.drawImage(img, 0, 0, dims.width, dims.height);

    let blob = await canvasToBlob(canvas, targetMime);

    // Iteratively scale down if still larger than target
    let iterations = 0;
    while (blob.size > targetBytes * 1.05 && iterations < 5 && scale > 0.15) {
      iterations++;
      onProgress?.(40 + iterations * 10);
      const ratio = Math.sqrt(targetBytes / blob.size);
      scale = Math.max(0.1, scale * Math.min(0.9, ratio));
      dims = calculateDimensions(origWidth, origHeight, settings.maxDimension, scale);

      canvas.width = dims.width;
      canvas.height = dims.height;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, dims.width, dims.height);
      blob = await canvasToBlob(canvas, targetMime);
    }

    onProgress?.(100);
    return {
      blob,
      width: dims.width,
      height: dims.height,
      mimeType: targetMime,
    };
  }

  // For JPEG / WebP / AVIF:
  // We use binary search on quality, and if lowest quality is still too large,
  // we scale down resolution.
  let currentScale = 1.0;
  let dims = calculateDimensions(origWidth, origHeight, settings.maxDimension, currentScale);
  
  canvas.width = dims.width;
  canvas.height = dims.height;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (targetMime === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0, dims.width, dims.height);

  // Binary search for quality
  let minQ = 0.05;
  let maxQ = 0.95;
  let bestBlob: Blob | null = null;
  let bestDiff = Infinity;
  let bestQuality = 0.75;

  onProgress?.(40);

  // 6 binary search steps
  for (let i = 0; i < 6; i++) {
    const q = (minQ + maxQ) / 2;
    const blob = await canvasToBlob(canvas, targetMime, q);
    const diff = Math.abs(blob.size - targetBytes);

    if (diff < bestDiff) {
      bestDiff = diff;
      bestBlob = blob;
      bestQuality = q;
    }

    // If within 5% tolerance, stop early
    if (Math.abs(blob.size - targetBytes) / targetBytes < 0.05) {
      bestBlob = blob;
      break;
    }

    if (blob.size > targetBytes) {
      maxQ = q;
    } else {
      minQ = q;
    }
  }

  onProgress?.(75);

  // If even at low quality (q <= 0.12) the blob is still > 1.15 * targetBytes,
  // downscale dimensions to meet the user's requested reduction!
  if (bestBlob && bestBlob.size > targetBytes * 1.15) {
    const dimensionFactor = Math.min(0.9, Math.sqrt(targetBytes / bestBlob.size));
    currentScale = Math.max(0.15, dimensionFactor);
    dims = calculateDimensions(origWidth, origHeight, settings.maxDimension, currentScale);

    canvas.width = dims.width;
    canvas.height = dims.height;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (targetMime === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, dims.width, dims.height);

    // Re-encode at moderate quality (0.65) with smaller dimensions
    bestBlob = await canvasToBlob(canvas, targetMime, Math.max(0.5, bestQuality));
  }

  onProgress?.(100);

  return {
    blob: bestBlob || (await canvasToBlob(canvas, targetMime, 0.7)),
    width: dims.width,
    height: dims.height,
    mimeType: targetMime,
  };
}
