'use client';

import { useState } from 'react';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  fallbackIcon?: string;
  className?: string;
  containerClassName?: string;
}

/**
 * Компонент для отображения изображения продукта с fallback на эмодзи
 */
export default function ProductImage({
  src,
  alt,
  fallbackIcon = '🍽️',
  className = 'h-full w-full object-cover',
  containerClassName = 'flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800',
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  console.log('🖼️ [ProductImage]', { src, alt, hasImage: !!src, imageError });

  // Если нет URL или произошла ошибка - показываем fallback
  if (!src || imageError) {
    return (
      <div className={containerClassName}>
        <span className="text-4xl">{fallbackIcon}</span>
      </div>
    );
  }

  return (
    <div className={`${containerClassName} relative`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <span className="text-2xl animate-pulse">⏳</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        onLoad={() => {
          console.log('✅ [ProductImage] Загружено:', alt);
          setIsLoading(false);
        }}
        onError={() => {
          console.log('❌ [ProductImage] Ошибка загрузки:', src);
          setIsLoading(false);
          setImageError(true);
        }}
      />
    </div>
  );
}
