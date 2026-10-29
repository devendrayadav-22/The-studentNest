import React, { useState } from 'react';
import { Home, Utensils, Image as ImageIcon } from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';

export const ImageWithFallback = ({
  src,
  alt = 'Image',
  className = '',
  fallbackType = 'pg', // 'pg' | 'mess' | 'general'
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = getImageUrl(src);

  if (!resolvedSrc || hasError) {
    const FallbackIcon = fallbackType === 'mess' ? Utensils : fallbackType === 'pg' ? Home : ImageIcon;

    return (
      <div
        className={`bg-gradient-to-br from-slate-200 via-slate-100 to-teal-50/40 flex flex-col items-center justify-center text-slate-400 select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        <FallbackIcon className="w-8 h-8 text-teal-600/50 mb-1" />
        <span className="text-[11px] font-medium text-slate-400">StudentNest</span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className={className}
      {...props}
    />
  );
};

export default ImageWithFallback;

