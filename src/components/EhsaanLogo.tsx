import React, { useState } from 'react';

interface EhsaanLogoProps {
  size?: number;
  className?: string;
  useRaster?: boolean;
}

export const EhsaanLogo: React.FC<EhsaanLogoProps> = ({
  size = 40,
  className = '',
}) => {
  const [loadError, setLoadError] = useState(false);

  if (!loadError) {
    return (
      <img
        src="/ehsaan-logo.webp"
        alt="EHSAAN Logo"
        width={size}
        height={size}
        onError={() => setLoadError(true)}
        referrerPolicy="no-referrer"
        className={`rounded-full object-cover shrink-0 select-none shadow-sm ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    );
  }

  // Fallback to crisp PNG or vector representation if WebP fails
  return (
    <img
      src="/ehsaan-logo.png"
      alt="EHSAAN Logo"
      width={size}
      height={size}
      referrerPolicy="no-referrer"
      className={`rounded-full object-cover shrink-0 select-none shadow-sm ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
};

