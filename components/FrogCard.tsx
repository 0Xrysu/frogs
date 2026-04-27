'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FrogMetadata } from '@/lib/types';
import { FrogCardSkeleton } from './SkeletonLoader';

interface FrogCardProps {
  frog: FrogMetadata & { id?: string };
  priority?: boolean;
}

export function FrogCard({ frog, priority = false }: FrogCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link
      href={`/frog/${frog.name.replace(/\s+/g, '-').toLowerCase()}`}
      prefetch={false}
    >
      <div className="group relative overflow-hidden rounded-lg bg-muted aspect-square cursor-pointer hover:shadow-lg transition-shadow">
        {/* Skeleton shown until image loads */}
        {!imageLoaded && (
          <div className="absolute inset-0 z-10">
            <FrogCardSkeleton />
          </div>
        )}
        
        <Image
          src={frog.image || '/placeholder.png'}
          alt={frog.name || 'Unknown Frog'}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className={`object-cover group-hover:scale-105 transition-all duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading={priority ? 'eager' : 'lazy'}
          priority={priority}
          onLoad={() => setImageLoaded(true)}
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJoc2woMjQwIDQuOCUgOTUuOSUpIi8+PC9zdmc+"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
          <div className="text-white">
            <p className="font-semibold text-sm">{frog.name}</p>
            <p className="text-xs text-gray-200">
              {frog.attributes?.find(a => a.trait_type === 'Rarity Tier')?.value}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
