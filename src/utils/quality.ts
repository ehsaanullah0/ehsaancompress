import { QualityAssessment, QualityLossLevel } from '../types';

/**
 * Fast helper to extract pixel data onto a canvas for analysis.
 * Uses a fixed normalized dimension (e.g., 384x384 or clamped proportional) for rapid analysis (<15ms).
 */
function getNormalizedImageData(
  img: HTMLImageElement,
  targetWidth = 384,
  targetHeight = 384
): ImageData | null {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'medium';
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  return ctx.getImageData(0, 0, targetWidth, targetHeight);
}

/**
 * Detects whether an image is text-heavy (documents, scanned receipts, screenshots, charts, diagrams)
 * vs a standard continuous-tone photograph.
 * Text & screenshots feature sharp bimodal luminance histograms, high local gradient density,
 * and high contrast transitions with lower unique color palette entropy.
 */
export function detectTextHeavy(imageData: ImageData): { isTextHeavy: boolean; edgeDensity: number } {
  const { data, width, height } = imageData;
  const totalPixels = width * height;
  let strongEdgeCount = 0;
  let highContrastNeighbors = 0;
  let bimodalLumaCount = 0; // very dark (<45) or very light (>210) pixels typical of text/paper/UI

  // Sample every 2nd pixel for blazing performance
  const step = 2;
  const sampleCount = Math.floor(width / step) * Math.floor(height / step);

  for (let y = step; y < height - step; y += step) {
    for (let x = step; x < width - step; x += step) {
      const idx = (y * width + x) * 4;
      // Perceived luminance: 0.299 R + 0.587 G + 0.114 B
      const luma = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];

      if (luma < 45 || luma > 215) {
        bimodalLumaCount++;
      }

      // Horizontal & Vertical gradient
      const rightIdx = (y * width + (x + step)) * 4;
      const downIdx = ((y + step) * width + x) * 4;

      const rightLuma = 0.299 * data[rightIdx] + 0.587 * data[rightIdx + 1] + 0.114 * data[rightIdx + 2];
      const downLuma = 0.299 * data[downIdx] + 0.587 * data[downIdx + 1] + 0.114 * data[downIdx + 2];

      const dx = Math.abs(luma - rightLuma);
      const dy = Math.abs(luma - downLuma);
      const gradient = dx + dy;

      if (gradient > 48) {
        strongEdgeCount++;
      }
      if (gradient > 95) {
        highContrastNeighbors++;
      }
    }
  }

  const edgeDensity = strongEdgeCount / sampleCount;
  const highContrastRatio = highContrastNeighbors / sampleCount;
  const bimodalRatio = bimodalLumaCount / sampleCount;

  // Documents & UI typically have high edge density combined with high contrast or bimodal paper/ink distribution
  const isTextHeavy =
    (edgeDensity > 0.08 && highContrastRatio > 0.035) ||
    (bimodalRatio > 0.45 && edgeDensity > 0.05) ||
    (highContrastRatio > 0.06);

  return { isTextHeavy, edgeDensity };
}

/**
 * Calculates Structural Similarity Index (SSIM) and Edge Preservation on luminance channel.
 */
export function calculateQualityMetrics(
  origImageData: ImageData,
  compImageData: ImageData
): { ssim: number; edgePreservation: number; psnr: number } {
  const { data: orig, width, height } = origImageData;
  const { data: comp } = compImageData;
  const totalPixels = width * height;

  if (orig.length !== comp.length) {
    return { ssim: 1.0, edgePreservation: 1.0, psnr: 40 };
  }

  // 1. Mean luminance
  let sumOrigLuma = 0;
  let sumCompLuma = 0;
  let sumSqDiff = 0;

  const lumaOrig = new Float32Array(totalPixels);
  const lumaComp = new Float32Array(totalPixels);

  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    // Check alpha: treat transparent as white for comparison
    const aOrig = orig[idx + 3] / 255;
    const aComp = comp[idx + 3] / 255;

    const rO = orig[idx] * aOrig + 255 * (1 - aOrig);
    const gO = orig[idx + 1] * aOrig + 255 * (1 - aOrig);
    const bO = orig[idx + 2] * aOrig + 255 * (1 - aOrig);

    const rC = comp[idx] * aComp + 255 * (1 - aComp);
    const gC = comp[idx + 1] * aComp + 255 * (1 - aComp);
    const bC = comp[idx + 2] * aComp + 255 * (1 - aComp);

    const lo = 0.299 * rO + 0.587 * gO + 0.114 * bO;
    const lc = 0.299 * rC + 0.587 * gC + 0.114 * bC;

    lumaOrig[i] = lo;
    lumaComp[i] = lc;

    sumOrigLuma += lo;
    sumCompLuma += lc;

    const diff = lo - lc;
    sumSqDiff += diff * diff;
  }

  const meanOrig = sumOrigLuma / totalPixels;
  const meanComp = sumCompLuma / totalPixels;

  // 2. Variance & Covariance
  let varOrig = 0;
  let varComp = 0;
  let covar = 0;

  for (let i = 0; i < totalPixels; i++) {
    const diffO = lumaOrig[i] - meanOrig;
    const diffC = lumaComp[i] - meanComp;

    varOrig += diffO * diffO;
    varComp += diffC * diffC;
    covar += diffO * diffC;
  }

  varOrig /= totalPixels;
  varComp /= totalPixels;
  covar /= totalPixels;

  // SSIM constants (standard values for 8-bit dynamic range L=255)
  const C1 = (0.01 * 255) ** 2; // ~6.5025
  const C2 = (0.03 * 255) ** 2; // ~58.5225

  const numerator = (2 * meanOrig * meanComp + C1) * (2 * covar + C2);
  const denominator = (meanOrig * meanOrig + meanComp * meanComp + C1) * (varOrig + varComp + C2);
  const ssim = Math.max(0, Math.min(1.0, denominator !== 0 ? numerator / denominator : 1.0));

  // 3. PSNR (Peak Signal-to-Noise Ratio)
  const mse = sumSqDiff / totalPixels;
  const psnr = mse > 0 ? 10 * Math.log10((255 * 255) / mse) : 99;

  // 4. Edge preservation (Sobel high-frequency gradient fidelity)
  let origEdgeSum = 0;
  let compEdgeSum = 0;
  let edgeLossSum = 0;

  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      const idx = y * width + x;

      // Fast central gradient
      const gxO = lumaOrig[idx + 1] - lumaOrig[idx - 1];
      const gyO = lumaOrig[idx + width] - lumaOrig[idx - width];
      const magO = Math.sqrt(gxO * gxO + gyO * gyO);

      const gxC = lumaComp[idx + 1] - lumaComp[idx - 1];
      const gyC = lumaComp[idx + width] - lumaComp[idx - width];
      const magC = Math.sqrt(gxC * gxC + gyC * gyC);

      origEdgeSum += magO;
      compEdgeSum += magC;

      // Measure character stroke edge smearing/blurring
      if (magO > 18) {
        const edgeRatio = Math.min(1.0, magC / magO);
        edgeLossSum += edgeRatio;
      }
    }
  }

  // Edge preservation ratio between 0.0 and 1.0
  const totalEdges = totalPixels / 4;
  const edgePreservation =
    origEdgeSum > 0 ? Math.max(0, Math.min(1.0, (edgeLossSum / (origEdgeSum / 25)) * 0.95)) : 1.0;

  return {
    ssim: Number(ssim.toFixed(4)),
    edgePreservation: Number(Math.max(0.2, Math.min(1.0, edgePreservation)).toFixed(4)),
    psnr: Number(psnr.toFixed(2)),
  };
}

/**
 * Evaluates degradation between original and compressed HTMLImageElements
 * and classifies it into Low, Moderate, High, or Critical quality loss.
 */
export async function evaluateImageQuality(
  origImg: HTMLImageElement,
  compImg: HTMLImageElement,
  targetSizeKbRequested?: number
): Promise<QualityAssessment> {
  const normWidth = 360;
  const normHeight = 360;

  const origData = getNormalizedImageData(origImg, normWidth, normHeight);
  const compData = getNormalizedImageData(compImg, normWidth, normHeight);

  if (!origData || !compData) {
    return {
      level: 'low',
      score: 95,
      ssim: 0.98,
      edgePreservation: 0.98,
      isTextHeavy: false,
      statusLabel: 'Quality preserved',
    };
  }

  const { isTextHeavy, edgeDensity } = detectTextHeavy(origData);
  const { ssim, edgePreservation, psnr } = calculateQualityMetrics(origData, compData);

  // Compute composite score (0 to 100)
  // For text/documents, edge preservation has higher weighting (55% edge, 45% SSIM)
  // For photos, SSIM has higher weighting (70% SSIM, 30% edge)
  let compositeScore = 0;
  if (isTextHeavy) {
    compositeScore = Math.round((ssim * 0.45 + edgePreservation * 0.55) * 100);
  } else {
    compositeScore = Math.round((ssim * 0.65 + edgePreservation * 0.35) * 100);
  }
  compositeScore = Math.max(0, Math.min(100, compositeScore));

  // Determine Quality Loss Level based on rigorous thresholds
  let level: QualityLossLevel = 'low';
  let statusLabel = 'Quality preserved';
  let warningTitle: string | undefined;
  let warningMessage: string | undefined;

  if (isTextHeavy) {
    // Stricter quality protection for text/documents/screenshots
    if (ssim < 0.70 || edgePreservation < 0.54 || compositeScore < 60) {
      level = 'critical';
      statusLabel = 'Severe quality loss';
      warningTitle = '⚠️ Severe quality loss';
      warningMessage =
        'The compressed image may no longer be suitable for documents, text, forms, or detailed graphics. We recommend using a higher quality setting.';
    } else if (ssim < 0.83 || edgePreservation < 0.72 || compositeScore < 76) {
      level = 'high';
      statusLabel = 'High quality loss detected';
      warningTitle = '⚠️ High quality loss detected';
      warningMessage =
        'This compression level has significantly reduced image quality. Text and fine details may appear blurry. Consider increasing the quality or allowing a larger file size.';
    } else if (ssim < 0.92 || edgePreservation < 0.84 || compositeScore < 88) {
      level = 'moderate';
      statusLabel = 'Moderate quality loss';
      warningMessage = 'Slight loss of fine edge definition noticed, but text remains legible.';
    } else {
      level = 'low';
      statusLabel = 'Quality preserved';
    }
  } else {
    // Photography & natural scenes quality tolerance
    if (ssim < 0.62 || compositeScore < 52 || psnr < 22) {
      level = 'critical';
      statusLabel = 'Severe quality loss';
      warningTitle = '⚠️ Severe quality loss';
      warningMessage =
        'Heavy compression artifacts and color banding detected. Consider increasing target size or quality.';
    } else if (ssim < 0.76 || compositeScore < 68 || psnr < 26) {
      level = 'high';
      statusLabel = 'High quality loss detected';
      warningTitle = '⚠️ High quality loss detected';
      warningMessage =
        'Compression has introduced visible pixelation or artifacting. Consider increasing quality for a crisper result.';
    } else if (ssim < 0.88 || compositeScore < 82) {
      level = 'moderate';
      statusLabel = 'Moderate quality loss';
      warningMessage = 'Minor compression artifacts present but generally visually acceptable.';
    } else {
      level = 'low';
      statusLabel = 'Quality preserved';
    }
  }

  return {
    level,
    score: compositeScore,
    ssim,
    edgePreservation,
    isTextHeavy,
    statusLabel,
    warningTitle,
    warningMessage,
  };
}
