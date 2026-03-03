'use client';

import { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  fallbackIcon?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

/**
 * Компонент для отображения изображения продукта с fallback на иконку
 */
export default function ProductImage({
  src,
  alt,
  fallbackIcon = <UtensilsCrossed className="h-10 w-10 text-gray-400" />,
  className = 'h-full w-full object-cover',
  containerClassName = 'flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800',
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Если нет URL или произошла ошибка - показываем fallback
  if (!src || imageError) {    return (
      <div className={containerClassName}>
        {fallbackIcon}
      </div>
    );
  }

  return (
    <div className={`${containerClassName} relative`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        onLoad={() => {          setIsLoading(false);
        }}
        onError={() => {          setIsLoading(false);
          setImageError(true);
        }}
      />
    </div>
  );
}
