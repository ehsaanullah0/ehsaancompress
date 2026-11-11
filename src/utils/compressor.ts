import { CompressionSettings, QualityAssessment } from '../types';
import { evaluateImageQuality, detectTextHeavy } from './quality';

export interface CompressionResult {
  blob: Blob;
  width: number;
  height: number;
  mimeType: string;
  qualityAssessment: QualityAssessment;
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

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${file.name}`));
    };

    img.src = url;
  });
}

/**
 * Load an HTMLImageElement directly from a Blob
 */
export function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to decode compressed image blob for quality inspection'));
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
 * Encode an image onto canvas and produce a blob with dimension scaling & background handling
 */
async function renderAndEncode(
  img: HTMLImageElement,
  width: number,
  height: number,
  mimeType: string,
  quality?: number
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: false });
  if (!ctx) throw new Error('Could not obtain canvas 2D rendering context');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Fill white background for JPEG when transparent pixels might turn black
  if (mimeType === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(img, 0, 0, width, height);
  return canvasToBlob(canvas, mimeType, quality);
}

/**
 * High-performance image compressor with Quality Loss Detection,
 * Text-Heavy Image Protection, Target File Size Conflict Detection,
 * and Automatic Quality Recovery.
 */
export async function compressImage(
  file: File,
  settings: CompressionSettings,
  onProgress?: (percent: number) => void
): Promise<CompressionResult> {
  onProgress?.(10);
  const origImg = await loadImageFromFile(file);
  const origWidth = origImg.naturalWidth || origImg.width;
  const origHeight = origImg.naturalHeight || origImg.height;

  // Determine target MIME type
  let targetMime = settings.format === 'original' ? file.type : settings.format;
  if (!targetMime || !isFormatSupported(targetMime)) {
    targetMime = isFormatSupported('image/webp') ? 'image/webp' : 'image/jpeg';
  }

  // Pre-analyze content: Is image text-heavy/document/screenshot?
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = Math.min(256, origWidth);
  tempCanvas.height = Math.min(256, origHeight);
  const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
  let isTextHeavy = false;
  if (tempCtx) {
    tempCtx.drawImage(origImg, 0, 0, tempCanvas.width, tempCanvas.height);
    const testData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    isTextHeavy = detectTextHeavy(testData).isTextHeavy;
  }

  onProgress?.(25);

  // 1. QUALITY MODE
  if (settings.mode === 'quality') {
    const dims = calculateDimensions(origWidth, origHeight, settings.maxDimension);
    const quality = Math.max(0.05, Math.min(1.0, settings.quality / 100));

    let blob = await renderAndEncode(origImg, dims.width, dims.height, targetMime, quality);
    onProgress?.(65);

    let compImg = await loadImageFromBlob(blob);
    let assessment = await evaluateImageQuality(origImg, compImg);

    // Automatic Quality Recovery if high/critical loss and not manually forced
    if (
      (assessment.level === 'high' || assessment.level === 'critical') &&
      !settings.allowAggressiveQualityLoss &&
      quality < 0.8
    ) {
      // Step quality up to find acceptable balance
      const recoveryQualitySteps = isTextHeavy ? [0.75, 0.85, 0.92] : [0.65, 0.75, 0.85];
      for (const stepQ of recoveryQualitySteps) {
        if (stepQ > quality) {
          const testBlob = await renderAndEncode(origImg, dims.width, dims.height, targetMime, stepQ);
          const testImg = await loadImageFromBlob(testBlob);
          const testAssessment = await evaluateImageQuality(origImg, testImg);

          if (testAssessment.level === 'low' || testAssessment.level === 'moderate') {
            blob = testBlob;
            compImg = testImg;
            assessment = {
              ...testAssessment,
              recovered: true,
              warningTitle: '⚡ Quality automatically preserved',
              warningMessage:
                'Quality was automatically recovered to prevent severe blurriness on fine details.',
            };
            break;
          }
        }
      }
    }

    onProgress?.(100);
    return {
      blob,
      width: dims.width,
      height: dims.height,
      mimeType: targetMime,
      qualityAssessment: assessment,
    };
  }

  // 2. TARGET SIZE / PERCENTAGE MODE
  let targetBytes: number;
  if (settings.mode === 'percentage') {
    const factor = Math.max(0.05, (100 - settings.reducePercentage) / 100);
    targetBytes = Math.round(file.size * factor);
  } else {
    // Target size floor of 10 KB protects against broken image headers or empty blobs
    const effectiveKb = Math.max(10, settings.targetSizeKb);
    targetBytes = Math.round(effectiveKb * 1024);
  }

  // Edge case: Target size is already larger than original file
  if (targetBytes >= file.size && settings.mode === 'target_size') {
    const dims = calculateDimensions(origWidth, origHeight, settings.maxDimension);
    const blob = await renderAndEncode(origImg, dims.width, dims.height, targetMime, 0.92);
    const compImg = await loadImageFromBlob(blob);
    const assessment = await evaluateImageQuality(origImg, compImg);
    onProgress?.(100);
    return {
      blob,
      width: dims.width,
      height: dims.height,
      mimeType: targetMime,
      qualityAssessment: assessment,
    };
  }

  // Binary search for optimal encoding parameters to match user's requested target size
  let minQ = 0.02;
  let maxQ = 0.98;
  let currentScale = 1.0;
  // Allow scaling down to 10% if necessary to hit aggressive KB limits
  const minScaleAllowed = 0.10;

  let dims = calculateDimensions(origWidth, origHeight, settings.maxDimension, currentScale);
  let bestBlob: Blob | null = null;
  let bestQuality = 0.75;
  let bestDiff = Infinity;

  // Handle PNG output
  if (targetMime === 'image/png') {
    let blob = await renderAndEncode(origImg, dims.width, dims.height, targetMime);
    let iterations = 0;
    while (blob.size > targetBytes * 1.05 && iterations < 8 && currentScale > minScaleAllowed) {
      iterations++;
      onProgress?.(30 + iterations * 8);
      const ratio = Math.sqrt(targetBytes / blob.size);
      currentScale = Math.max(minScaleAllowed, currentScale * Math.min(0.85, ratio));
      dims = calculateDimensions(origWidth, origHeight, settings.maxDimension, currentScale);
      blob = await renderAndEncode(origImg, dims.width, dims.height, targetMime);
    }
    bestBlob = blob;
  } else {
    // Lossy formats: JPEG, WebP, AVIF
    let pass = 0;
    while (pass < 3) {
      pass++;
      minQ = 0.02;
      maxQ = 0.98;
      for (let i = 0; i < 8; i++) {
        const q = (minQ + maxQ) / 2;
        const blob = await renderAndEncode(origImg, dims.width, dims.height, targetMime, q);
        const diff = Math.abs(blob.size - targetBytes);

        if (diff < bestDiff || (blob.size <= targetBytes && (!bestBlob || bestBlob.size > targetBytes))) {
          bestDiff = diff;
          bestBlob = blob;
          bestQuality = q;
        }

        if (Math.abs(blob.size - targetBytes) / targetBytes < 0.03) {
          bestBlob = blob;
          break;
        }

        if (blob.size > targetBytes) {
          maxQ = q;
        } else {
          minQ = q;
        }
      }

      // If bestBlob still exceeds target bytes, scale dimensions down to hit user's target KB cap
      if (bestBlob && bestBlob.size > targetBytes * 1.05 && currentScale > minScaleAllowed) {
        const scaleRatio = Math.sqrt(targetBytes / bestBlob.size);
        currentScale = Math.max(minScaleAllowed, currentScale * Math.min(0.88, scaleRatio));
        dims = calculateDimensions(origWidth, origHeight, settings.maxDimension, currentScale);
        bestDiff = Infinity;
      } else {
        break; // Closest or exact target match achieved
      }
    }
  }

  onProgress?.(80);

  let finalBlob = bestBlob || (await renderAndEncode(origImg, dims.width, dims.height, targetMime, 0.7));
  let finalCompImg = await loadImageFromBlob(finalBlob);
  let assessment = await evaluateImageQuality(origImg, finalCompImg);

  // Informative Quality Warning: Purely aware and inform the user of quality trade-offs, NEVER block or override user's target size compression!
  if (assessment.level === 'high' || assessment.level === 'critical' || finalBlob.size > targetBytes * 1.25) {
    const targetKb = Math.round(targetBytes / 1024);
    const actualKb = Math.round(finalBlob.size / 1024);

    // Calculate a safe recommended size for user reference if they want higher visual clarity
    const safeScale = Math.max(0.70, currentScale);
    const safeQ = 0.80;
    const safeDims = calculateDimensions(origWidth, origHeight, settings.maxDimension, safeScale);
    const safeBlob = await renderAndEncode(origImg, safeDims.width, safeDims.height, targetMime, safeQ);
    const recommendedSizeKb = Math.max(10, Math.round(safeBlob.size / 1024));

    assessment = {
      ...assessment,
      targetConflict: true,
      recommendedSizeKb,
      warningTitle:
        assessment.level === 'critical'
          ? '⚠️ Notice: High compression applied'
          : '⚠️ Notice: Visual quality trade-off',
      warningMessage:
        `Compressed to ~${actualKb} KB as requested (Target: ${targetKb} KB). Quality or dimension reduction occurred to achieve your requested size limit.`,
    };
  }

  onProgress?.(100);

  return {
    blob: finalBlob,
    width: dims.width,
    height: dims.height,
    mimeType: targetMime,
    qualityAssessment: assessment,
  };
}
