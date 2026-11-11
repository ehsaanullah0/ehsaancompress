import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Github,
  History,
  ExternalLink,
  Sparkles,
  Tag,
  CheckCircle2,
  X,
  Heart,
  Copy,
  Check,
  ArrowUpRight,
  Coffee,
  Coins,
  QrCode as QrCodeIcon,
  Download,
  Flame,
  HelpCircle,
} from 'lucide-react';
import { EhsaanLogo } from './EhsaanLogo';

export interface ChangelogItem {
  version: string;
  releaseType: 'Latest Release' | 'Previous Release' | 'Initial Release';
  isCurrent?: boolean;
  title: string;
  date: string;
  points: string[];
}

export const CHANGELOG_DATA: ChangelogItem[] = [
  {
    version: 'v1.6.0',
    releaseType: 'Latest Release',
    isCurrent: true,
    title: 'AI Background Removal, Dual Primary Buttons & Clean White Processed Area',
    date: 'Latest Release',
    points: [
      'Redesigned Processed Image Area with minimal, clean white background for crystal-clear image visibility and contrast.',
      'Added two big, tactile action buttons between upload/settings and processed areas: "Compress" and "Remove-BG".',
      'Implemented 100% client-side background removal capabilities with alpha transparency, solid white, or custom background options.',
      'Added multi-backdrop preview switch (Crisp White, Transparency Grid, Dark Contrast) for inspecting cutouts.',
      'Per-item quick action toggle to seamlessly switch individual images between compressed and background-removed states.',
    ],
  },
  {
    version: 'v1.5.0',
    releaseType: 'Previous Release',
    isCurrent: false,
    title: 'Unified Minimal Showcase, Odoo Integration & Community Support',
    date: 'Previous Release',
    points: [
      'Merged ehsaan.odoo.com enterprise ERP showcase seamlessly into the unified, minimal GitHub footer showcase.',
      'Added Community Support modal with direct UPI deep link (upi://pay?pa=9454989954%40fam&cu=INR) and instant QR code popup.',
      'Reduced vertical container dimensions and padding for a sleek, compact visual footprint.',
      'Enhanced action cluster with quick repository copy, star trigger, and direct version tracking.',
    ],
  },
  {
    version: 'v1.4.0',
    releaseType: 'Previous Release',
    title: 'Quality Loss Detection, Text-Heavy Protection & Target Conflict Engine',
    date: 'Previous Release',
    points: [
      'Structural Similarity Index (SSIM) & Peak Signal-to-Noise Ratio (PSNR) engine evaluating perceptual fidelity against original inputs in real-time.',
      'Text-heavy heuristic classifier automatically detecting documents, forms, receipts, and UI screenshots to enforce crisp stroke sharpness.',
      'Target File Size Conflict Detection warning users when reaching an aggressive KB target causes severe blur, with safe recommended sizes.',
      'Quality status indicators on all queue items (Quality Preserved, Moderate, High, Severe) with single-click recovery and comparison modal metrics.',
    ],
  },
  {
    version: 'v1.3.0',
    releaseType: 'Previous Release',
    title: 'Google Material Design Warm Palette & Multi-Theme System',
    date: 'Previous Release',
    points: [
      'Added 3-way theme system (System Default, Obsidian Dark, and Google Material Warm Palette with #FFFDF6 surfaces & amber accents).',
      'Refined card typography, micro-badges, and visual container hierarchy across all viewport breakpoints.',
      'Optimized responsive layout and touch targets for mobile and tablet screens.',
    ],
  },
  {
    version: 'v1.2.0',
    releaseType: 'Previous Release',
    title: 'Interactive Side-by-Side & Split-Slider Comparison Modal',
    date: 'Feature Update',
    points: [
      'Dual-view comparison modal with synchronized pan and 50% to 500% zoom controls for pixel-level clarity inspection.',
      'Interactive split-slider wipe allowing users to drag and inspect exact before/after transitions in real-time.',
      'Live compression delta metrics, byte reductions, and dimension statistics directly inside the comparison suite.',
    ],
  },
  {
    version: 'v1.1.0',
    releaseType: 'Previous Release',
    title: 'Multi-Mode Compression & Format Conversion Engine',
    date: 'Feature Update',
    points: [
      'Three flexible compression modes: Target Size (KB), Percentage Reduction (5%–95%), and Quality slider.',
      'Format transcoding supporting modern WebP, AVIF, JPEG, and PNG outputs with resolution downscaling presets.',
      'Batch queue pipeline with concurrent processing and one-click ZIP archive export.',
    ],
  },
  {
    version: 'v1.0.0',
    releaseType: 'Initial Release',
    title: 'Initial Architecture & Client-Side Engine Release',
    date: 'Initial Launch',
    points: [
      '100% Client-Side In-Browser execution — zero server uploads, complete data privacy.',
      'High-performance HTML5 Canvas rendering pipeline with automatic transparent background management.',
      'Drag-and-drop file ingestion, live preview queue, individual and bulk download controls.',
    ],
  },
];

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [showQrPopup, setShowQrPopup] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const upiId = '9454989954@fam';
  const upiLink = 'upi://pay?pa=9454989954%40fam&cu=INR';

  useEffect(() => {
    if (isOpen) {
      // Generate scannable high-resolution UPI QR code
      QRCode.toDataURL(upiLink, {
        width: 600,
        margin: 2,
        color: {
          dark: '#1a1b26',
          light: '#FFF9EB',
        },
        errorCorrectionLevel: 'H',
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate QR', err));
    }
  }, [isOpen, upiLink]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-md bg-white text-zinc-900 dark:bg-[#121319] dark:text-white dark:border dark:border-zinc-800 material:bg-[#FFFDF6] material:text-amber-950 material:border material:border-amber-300 rounded-3xl shadow-2xl overflow-hidden flex flex-col p-5 sm:p-6 space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <EhsaanLogo
                size={42}
                shape="rounded-rect"
                className="shrink-0 shadow-md ring-2 ring-pink-500/20"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-white material:text-amber-950">
                    Support Ehsaan Compressor
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-400 text-black">
                    ₹20
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 material:text-amber-900/70">
                  Help keep this tool 100% free, private & mature
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-zinc-800 material:hover:bg-amber-100 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Message Note Card */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-500/30 space-y-2.5 material:bg-amber-100/50">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Support Request Note</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-200 material:text-amber-950 leading-relaxed font-medium">
              Please support <strong className="text-amber-600 dark:text-amber-400 font-bold">20 RS</strong> to make this app free, fast, and mature!
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 material:text-amber-900/80 leading-relaxed">
              Ehsaan Compressor runs completely in your browser without tracking, subscriptions, or ads. Your small support powers ongoing development, new format decoders, and lossless algorithms.
            </p>
          </div>

          {/* Quick Value Points */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-600 dark:text-zinc-400 material:text-amber-900/80">
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 material:bg-amber-50/50 material:border-amber-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Zero server cost</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 material:bg-amber-50/50 material:border-amber-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>100% Privacy</span>
            </div>
          </div>

          {/* Payment / UPI Box */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 material:text-amber-900">
              <span>UPI ID / Contribution</span>
              <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400">₹20 or any amount</span>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 material:bg-amber-50 material:border-amber-200">
              <Coins className="w-4 h-4 text-amber-500 shrink-0 ml-1" />
              <span className="font-mono text-xs text-zinc-800 dark:text-zinc-200 material:text-amber-950 font-semibold truncate flex-1">
                {upiId}
              </span>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs shrink-0"
              >
                {copiedUpi ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-950" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy UPI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Primary Action Button (Exact Link: upi://pay?pa=9454989954%40fam&cu=INR) */}
          <div className="pt-2 space-y-2.5">
            <div className="flex items-center gap-2">
              <a
                href={upiLink}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-[#E9B553] hover:bg-[#DDA540] text-zinc-950 font-bold text-xs shadow-sm transition-all active:scale-95 min-h-[40px]"
              >
                <Coffee className="w-4 h-4 shrink-0" />
                <span>Support via UPI App</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 material:bg-amber-200/70 material:text-amber-950 font-medium text-xs transition-all min-h-[40px]"
              >
                Close
              </button>
            </div>

            {/* Direct payment not working? Clickable link to trigger QR Popup */}
            <div className="text-center pt-0.5">
              <button
                type="button"
                onClick={() => setShowQrPopup(true)}
                className="inline-flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 material:text-amber-900 font-semibold hover:underline underline-offset-2 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-amber-100/60 dark:hover:bg-amber-950/40"
              >
                <QrCodeIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Direct payment not working?</span>
                <span className="text-[11px] font-normal text-zinc-500 dark:text-zinc-400">(Scan QR Code)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Popup Dialog */}
      {showQrPopup && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setShowQrPopup(false)}
        >
          <div
            className="relative w-full max-w-sm bg-[#FFF9EB] text-zinc-950 border-2 border-amber-300 rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 text-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setShowQrPopup(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-600 hover:text-black hover:bg-black/10 transition-colors"
              aria-label="Close QR dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* QR Title */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E9B553] text-black text-[10.5px] font-bold uppercase shadow-2xs">
                <QrCodeIcon className="w-3.5 h-3.5" />
                <span>UPI Scan & Pay</span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-zinc-950 tracking-tight">
                Scan to Support ₹20
              </h4>
              <p className="text-xs text-zinc-700">
                Open Google Pay, PhonePe, Paytm, FamPay, or any UPI app
              </p>
            </div>

            {/* QR Visual Container with Flame Badge */}
            <div className="relative mx-auto w-56 h-56 sm:w-64 sm:h-64 p-3 bg-white rounded-2xl border border-amber-300/80 shadow-md flex items-center justify-center">
              {qrDataUrl ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={qrDataUrl}
                    alt="UPI Payment QR Code"
                    className="w-full h-full object-contain rounded-xl"
                  />
                  {/* Center Flame Icon Badge matching uploaded design */}
                  <div className="absolute inset-0 m-auto w-11 h-11 rounded-full bg-[#B7C582] border-2 border-white shadow-md flex items-center justify-center pointer-events-none">
                    <Flame className="w-6 h-6 text-red-500 fill-amber-400 stroke-[2]" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-zinc-500 font-mono">
                  Loading QR...
                </div>
              )}
            </div>

            {/* UPI ID Info with Copy Button */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/80 border border-amber-200">
                <span className="font-mono text-xs font-bold text-zinc-800 ml-1">
                  {upiId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center gap-1 transition-all active:scale-95 shadow-2xs"
                >
                  {copiedUpi ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-950" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowQrPopup(false)}
                className="w-full py-2.5 rounded-xl bg-zinc-950 hover:bg-black text-white font-bold text-xs transition-all active:scale-95 shadow-sm"
              >
                Back to Support Note
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[88vh] bg-white text-zinc-900 dark:bg-[#121319] dark:text-white dark:border dark:border-zinc-800 material:bg-[#FFFDF6] material:text-amber-950 material:border material:border-amber-300 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800/80 material:border-amber-200/80 bg-white dark:bg-[#121319] material:bg-[#FFFDF6] shrink-0">
          <div className="flex items-start gap-3.5">
            <EhsaanLogo
              size={44}
              shape="squircle"
              className="shrink-0 shadow-md ring-2 ring-pink-500/20 mt-0.5"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-white material:text-amber-950">
                  Changelog & Releases
                </h3>
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-amber-400 text-black shadow-xs">
                  v1.6.0
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 material:text-amber-900/70">
                Track latest features, enhancements, and open-source updates.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-zinc-800 material:hover:bg-amber-100 material:text-amber-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center -mr-1"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Feed (Zero visible scrollbars/slidebars) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 no-scrollbar scrollbar-none overscroll-contain bg-zinc-50/50 dark:bg-[#0e0f14] material:bg-[#FAF6EC]/60">
          {CHANGELOG_DATA.map((release) => {
            const isLatest = release.isCurrent || release.releaseType === 'Latest Release';

            return (
              <div
                key={release.version}
                className={`rounded-2xl p-5 sm:p-6 space-y-3.5 transition-all ${
                  isLatest
                    ? 'border-2 border-amber-400/90 dark:border-amber-400/80 bg-white dark:bg-[#161720] material:bg-[#FFFDF6] shadow-sm'
                    : 'border border-zinc-200/90 dark:border-zinc-800 bg-white/80 dark:bg-[#14151c] material:bg-[#FFFDF6]/90'
                }`}
              >
                {/* Release Card Header */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                        isLatest
                          ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-950 dark:text-amber-300 border border-amber-300/80 dark:border-amber-500/40'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      <Tag className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>{release.version}</span>
                    </span>
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 material:text-amber-900/70">
                      {release.releaseType}
                    </span>
                  </div>

                  {isLatest && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Current Version</span>
                    </div>
                  )}
                </div>

                {/* Release Title */}
                <h4 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white material:text-amber-950 leading-snug">
                  {release.title}
                </h4>

                {/* Release Checkmark Bullet Points */}
                <ul className="space-y-2.5 pt-1">
                  {release.points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 material:text-amber-950/80 leading-relaxed">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-zinc-100 dark:border-zinc-800/80 material:border-amber-200/80 bg-white dark:bg-[#121319] material:bg-[#FFFDF6] flex items-center justify-between gap-3 text-xs shrink-0">
          <a
            href="https://github.com/ehsaanullah0/ehsaancompress/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white material:text-amber-900/70 material:hover:text-amber-950 inline-flex items-center gap-1.5 font-mono transition-colors"
          >
            <span>github.com/ehsaanullah0/ehsaancompress/releases</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-zinc-900 hover:bg-black text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-950 material:bg-amber-950 material:text-amber-100 material:hover:bg-amber-900 font-bold text-xs transition-all shadow-sm active:scale-95 min-h-[36px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const FooterAndChangelogSection: React.FC<{
  onOpenChangelog?: () => void;
}> = ({ onOpenChangelog }) => {
  const [copied, setCopied] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('ehsaan_github_showcase_hidden') !== 'true';
      } catch {
        return true;
      }
    }
    return true;
  });

  const handleCopyRepo = () => {
    navigator.clipboard.writeText('https://github.com/ehsaanullah0/ehsaancompress');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHideShowcase = () => {
    setIsVisible(false);
    try {
      localStorage.setItem('ehsaan_github_showcase_hidden', 'true');
    } catch {
      // Ignore
    }
  };

  const handleShowShowcase = () => {
    setIsVisible(true);
    try {
      localStorage.removeItem('ehsaan_github_showcase_hidden');
    } catch {
      // Ignore
    }
  };

  return (
    <>
      {!isVisible ? (
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleShowShowcase}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 material:text-amber-800/80 material:hover:text-amber-950 bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-900/60 dark:hover:bg-zinc-850 material:bg-amber-100/70 material:hover:bg-amber-200/70 transition-all border border-zinc-200/80 dark:border-zinc-800/80 material:border-amber-200/80"
            title="Restore GitHub & Open Source Showcase"
          >
            <Github className="w-3.5 h-3.5" />
            <span>Show GitHub Info</span>
          </button>
        </div>
      ) : (
        <div
          id="ehsaan-github-showcase"
          className="mt-8 rounded-2xl p-4 sm:p-5 border border-amber-200/80 dark:border-zinc-800/90 material:border-amber-300 bg-gradient-to-br from-[#FFFDF6] via-[#FFF9EB] to-[#FFF4D6] dark:from-[#14151e] dark:via-[#111218] dark:to-[#0c0d12] material:from-[#FFFDF6] material:via-[#FAF5E8] material:to-[#F5EBD0] shadow-xs relative overflow-hidden text-zinc-900 dark:text-white material:text-amber-950 space-y-3.5 transition-all"
        >
          {/* Deep Red Cross Button to Hide Showcase */}
          <button
            type="button"
            onClick={handleHideShowcase}
            className="absolute top-3.5 right-3.5 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-700 hover:bg-red-800 active:bg-red-900 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 cursor-pointer"
            title="Hide GitHub showcase"
            aria-label="Hide GitHub showcase"
          >
            <X className="w-4 h-4 stroke-[2.75]" />
          </button>

          {/* Top Badges Row: Open Source, Odoo Showcase, MIT & Client-Side */}
          <div className="flex items-center gap-2 flex-wrap text-xs pr-9 sm:pr-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E9B553] text-zinc-950 font-bold text-[10.5px] tracking-wide uppercase shadow-2xs">
              <Github className="w-3 h-3 fill-current shrink-0" />
              <span>OPEN SOURCE PROJECT</span>
            </div>

          {/* Merged Odoo Showcase Badge */}
          <a
            href="https://ehsaan.odoo.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Explore Ehsaan Enterprise Software on Odoo"
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#B1BD70] hover:bg-[#a2ae60] text-zinc-950 font-semibold text-[10.5px] transition-all shadow-2xs group active:scale-95"
          >
            <EhsaanLogo size={16} shape="circle" className="shrink-0 ring-1 ring-black/10" />
            <span>Ehsaan on Odoo</span>
            <span className="text-[9px] bg-black/10 px-1 py-0.2 rounded font-mono">ehsaan.odoo.com</span>
            <ArrowUpRight className="w-3 h-3 text-zinc-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>

          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFF9EB] dark:bg-amber-950/40 text-[#925608] dark:text-amber-300 border border-[#E9B553]/70 font-semibold text-[10.5px] shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#E9B553]" />
            <span>MIT Licensed</span>
          </div>

          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/80 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 border border-zinc-200/90 dark:border-zinc-700/80 text-[10.5px] font-medium shadow-2xs">
            <span>100% Client-Side</span>
          </div>
        </div>

        {/* Main Content: Heading & Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 sm:gap-4">
          {/* Left Description Column */}
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-white material:text-amber-950">
                Ehsaan Compressor is Open Source
              </h2>
              <Heart className="w-4 h-4 text-amber-500 fill-amber-500/20 stroke-[2] shrink-0" />
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 material:text-amber-900/80 leading-relaxed">
              Designed for simplicity and built privacy-first with zero tracking. Explore the codebase on GitHub, visit our enterprise tools on{' '}
              <a
                href="https://ehsaan.odoo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline decoration-amber-400 hover:text-amber-600 dark:hover:text-amber-300"
              >
                ehsaan.odoo.com
              </a>
              , or support our project.
            </p>
          </div>

          {/* Right Action Buttons Cluster (Compact & minimal) */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
            {/* 1. Star on GitHub Button */}
            <a
              href="https://github.com/ehsaanullah0/ehsaancompress"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E9B553] hover:bg-[#DDA540] text-zinc-950 font-bold text-xs shadow-2xs transition-all active:scale-95 min-h-[36px] shrink-0"
            >
              <Github className="w-3.5 h-3.5 fill-current shrink-0" />
              <span>Star</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>

            {/* 2. Support ₹20 Button (Pop up note modal) */}
            <button
              type="button"
              onClick={() => setShowSupportModal(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-2xs transition-all active:scale-95 min-h-[36px] shrink-0"
            >
              <Heart className="w-3.5 h-3.5 text-zinc-950 fill-zinc-950/20 shrink-0" />
              <span>Support (₹20)</span>
            </button>

            {/* 3. Version Changelog Button */}
            {onOpenChangelog && (
              <button
                type="button"
                onClick={onOpenChangelog}
                className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 border border-zinc-200/90 text-zinc-800 material:bg-[#FFFDF6] material:border-amber-300 material:text-amber-950 font-semibold text-xs shadow-2xs transition-all active:scale-95 min-h-[36px] shrink-0"
              >
                <Tag className="w-3 h-3 text-amber-500 shrink-0" />
                <span>v1.6.0</span>
              </button>
            )}

            {/* 4. Repo URL Copy Button */}
            <button
              type="button"
              onClick={handleCopyRepo}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 border border-zinc-200/90 text-zinc-700 font-mono text-[11px] shadow-2xs transition-all active:scale-95 min-h-[36px] shrink-0"
              title="Click to copy repository URL"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-sans font-semibold text-xs">
                    Copied
                  </span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-zinc-400 dark:text-zinc-500 shrink-0" />
                  <span className="truncate">ehsaancompress</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Features Bullet Points */}
        <div className="pt-1 flex items-center gap-3 sm:gap-5 flex-wrap text-[11px] text-zinc-600 dark:text-zinc-400 material:text-amber-900/80 font-medium border-t border-amber-200/60 dark:border-zinc-800/60 material:border-amber-300/40">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span>Zero telemetry & tracking</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span>React + Vite + Tailwind</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span>Free forever for everyone</span>
          </div>
        </div>
      </div>
      )}

      {/* Support Pop-up Modal */}
      <SupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />
    </>
  );
};
