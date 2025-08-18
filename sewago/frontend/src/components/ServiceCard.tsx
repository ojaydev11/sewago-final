'use client';

import { useTranslations } from 'next-intl';
import { useLocalizedCurrency } from '@/hooks/useLocalizedCurrency';
import { useLiteOptimizations } from '@/providers/lite-mode';
import Link from 'next/link';
import Image from 'next/image';

interface Service {
  id: string;
  title: string;
  category: string;
  description: string;
  basePrice: number;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  providerName: string;
}

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const t = useTranslations('services');
  const { formatCurrency } = useLocalizedCurrency();
  const { imageQuality, showThumbnails, reduceAnimations } = useLiteOptimizations();

  const categoryKey = service.category.toLowerCase() as keyof Record<string, unknown>;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
      reduceAnimations ? 'transition-none' : 'transition-shadow duration-200'
    }`}>
      {/* Service Image */}
      {showThumbnails && service.imageUrl && (
        <div className="aspect-w-16 aspect-h-9 relative">
          <Image
            src={service.imageUrl}
            alt={service.title}
            fill
            className="object-cover rounded-t-lg"
            quality={imageQuality}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="p-4">
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-2">
          <span className="inline-block px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
            {t(`categories.${String(categoryKey)}`, { fallback: service.category })}
          </span>
          
          {/* Rating */}
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{service.rating.toFixed(1)}</span>
            <span className="text-gray-400">({service.reviewCount})</span>
          </div>
        </div>

        {/* Service Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {service.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {service.description}
        </p>

        {/* Provider Name */}
        <p className="text-xs text-gray-500 mb-3">
          {t('by')} {service.providerName}
        </p>

        {/* Price and Book Button */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-gray-900">
            <span className="text-sm font-normal text-gray-500">
              {t('startingFrom')}
            </span>
            <div>
              {formatCurrency(service.basePrice)}
              <span className="text-sm font-normal text-gray-500 ml-1">
                {t('perHour')}
              </span>
            </div>
          </div>

          <Link
            href={`/services/${service.id}`}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {t('bookNow')}
          </Link>
        </div>
      </div>
    </div>
  );
}

// Skeleton loader for lite mode
export function ServiceCardSkeleton() {
  const { showThumbnails } = useLiteOptimizations();

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm animate-pulse">
      {showThumbnails && (
        <div className="aspect-w-16 aspect-h-9 bg-gray-300 rounded-t-lg"></div>
      )}
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="h-5 bg-gray-300 rounded-full w-20"></div>
          <div className="h-4 bg-gray-300 rounded w-16"></div>
        </div>
        
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-full mb-1"></div>
        <div className="h-4 bg-gray-300 rounded w-2/3 mb-3"></div>
        <div className="h-3 bg-gray-300 rounded w-24 mb-3"></div>
        
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-300 rounded w-20"></div>
          <div className="h-8 bg-gray-300 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
}
