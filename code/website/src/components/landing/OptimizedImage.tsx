"use client"

import React, { useState } from 'react';

const OptimizedImage = ({ src, alt, className, priority = false }: { 
  src: string; 
  alt: string; 
  className?: string; 
  priority?: boolean;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative ${className || ''}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
      )}
      <img
        src={src}
        alt={alt}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className || ''}`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        style={{ 
          maxWidth: '100%', 
          height: 'auto',
          ...(hasError && { display: 'none' })
        }}
      />
      {hasError && (
        <div className="flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg h-full min-h-[200px]">
          <span>Image not available</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
