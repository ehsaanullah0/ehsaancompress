import React from 'react';

export type LogoShape = 'squircle' | 'circle' | 'rounded-rect' | 'hexagon' | 'glyph-only';

interface AppLogoProps {
  size?: number;
  shape?: LogoShape;
  className?: string;
}

/**
 * Geometric Vector Glyph of the Compression Logo:
 * - Two converging inward compression arrows pressing downwards
 * - Three layered digital planar plates below absorbing compression
 */
export const CompressionGlyph: React.FC<{
  size?: number;
  color?: string;
  className?: string;
}> = ({ size = 24, color = '#5B21B6', className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Top Left Converging Arrow */}
      <path
        d="M26 26 L38 38 L48 48 L48 33 L50 35 L50 49 L33 47 L43 37 L26 26 Z"
        fill={color}
      />
      {/* Dual Inward Compression Arrows Solid Silhouette */}
      <path
        d="M26 26 L42 42 L48 35 L48 49 L34 49 L41 43 L26 26 Z"
        fill={color}
      />
      <path
        d="M74 26 L58 42 L52 35 L52 49 L66 49 L59 43 L74 26 Z"
        fill={color}
      />
      {/* Central compression apex */}
      <polygon points="50,34 53,48 47,48" fill={color} />

      {/* Layer 1 (Upper compressed chevron plate) */}
      <path
        d="M28 47 L50 51 L72 47 L74 53 L50 63 L26 53 Z"
        fill={color}
      />
      {/* Layer 2 (Middle chevron plate) */}
      <path
        d="M26 54 L50 64 L74 54 L74 61 L50 71 L26 61 Z"
        fill={color}
      />
      {/* Layer 3 (Base chevron plate) */}
      <path
        d="M26 62 L50 72 L74 62 L74 69 L50 79 L26 69 Z"
        fill={color}
      />
    </svg>
  );
};

/**
 * EhsaanLogo / AppLogo Component
 * Renders the brand new Pink & Purple Compression Logo in various adaptive shapes:
 * - 'squircle': Android-style super-ellipse with soft curvature (header & app launcher)
 * - 'circle': Seamless circular badge (badges, micro-avatars, status pills)
 * - 'rounded-rect': Clean rounded container (cards, hero sections)
 * - 'hexagon': Precision geometric tech polygon
 * - 'glyph-only': The pure purple compression glyph without background
 */
export const EhsaanLogo: React.FC<AppLogoProps> = ({
  size = 40,
  shape = 'squircle',
  className = '',
}) => {
  if (shape === 'glyph-only') {
    return <CompressionGlyph size={size} color="#5B21B6" className={className} />;
  }

  // Determine shape styling
  let shapeRadiusClass = 'rounded-2xl'; // default squircle / rounded
  if (shape === 'circle') {
    shapeRadiusClass = 'rounded-full';
  } else if (shape === 'rounded-rect') {
    shapeRadiusClass = 'rounded-xl';
  }

  const innerGlyphSize = Math.max(12, Math.round(size * 0.72));

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none overflow-hidden transition-transform duration-200 shadow-sm ${shapeRadiusClass} ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: '#FF6584', // Vibrant Pink Background
      }}
      title="Ehsaan Compressor"
      aria-label="Ehsaan Compressor Logo"
    >
      <img
        src="/app-icon-pink-purple.png"
        alt="Ehsaan Compressor"
        className="w-full h-full object-cover pointer-events-none"
        onError={(e) => {
          // If image fails, smoothly render SVG glyph fallback
          const target = e.currentTarget;
          target.style.display = 'none';
        }}
      />
      {/* In-DOM Vector fallback if asset loading is delayed */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
        <CompressionGlyph size={innerGlyphSize} color="#5B21B6" />
      </div>
    </div>
  );
};

export default EhsaanLogo;
