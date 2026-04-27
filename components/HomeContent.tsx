'use client';

import { useState, useEffect } from 'react';
import FrogControls from './FrogControls';
import { FrogGridSkeleton } from './SkeletonLoader';
import { FiFilter, FiRefreshCw } from 'react-icons/fi';

interface SimpleFrog {
  name: string;
  image: string;
}

interface FrogMetadataItem {
  name: string;
  image: string;
  description?: string;
  created_at?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
}

export function HomeContent() {
  const [frogs, setFrogs] = useState<SimpleFrog[]>([]);
  const [metadata, setMetadata] = useState<FrogMetadataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [skeletonCount, setSkeletonCount] = useState(16);
  const [targetCount, setTargetCount] = useState<number | null>(null);

  useEffect(() => {
    if (targetCount === null) return;
    if (skeletonCount >= targetCount) return;

    const timer = setTimeout(() => {
      setSkeletonCount(prev => Math.min(prev + 5, targetCount));
    }, 100);

    return () => clearTimeout(timer);
  }, [skeletonCount, targetCount]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [imagesRes, metadataRes] = await Promise.all([
          fetch('/api/images'),
          fetch('/api/metadata'),
        ]);

        if (imagesRes.ok) {
          const imagesData = await imagesRes.json();
          const total = imagesData.total || imagesData.images?.length;
          setTargetCount(total);

          const normalizedFrogs = (imagesData.images || []).map((img: { url: string; filename: string }) => {
            const name = (img.filename || 'unknown')
              .replace(/\.(png|jpg|jpeg|gif|webp)$/i, '')
              .replace(/[-_]/g, ' ')
              .replace(/\b\w/g, (c: string) => c.toUpperCase());
            return { name, image: img.url };
          });
          setFrogs(normalizedFrogs);
        }

        if (metadataRes.ok) {
          const metadataData = await metadataRes.json();
          setMetadata(metadataData.metadata || []);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <p className="text-muted-foreground text-base max-w-2xl">
        1/1 pixel art archive dedicated to the global diversity of frogs. Every specimen in this collection is a unique digital preservation of a real-world species.
      </p>
      
      {loading ? (
        <div className="mt-6 relative w-full">
          <div className="flex w-full border border-border rounded-lg overflow-hidden bg-background">
            <input
              type="text"
              placeholder="Search frogs..."
              className="flex-1 px-4 py-2 text-sm outline-none bg-background text-foreground placeholder:text-muted-foreground"
              disabled
            />
            <button
              className="px-3 py-2 bg-muted text-muted-foreground flex items-center opacity-50 cursor-not-allowed"
              disabled
            >
              <FiFilter size={18} />
            </button>
            <button
              className="px-3 py-2 bg-muted text-muted-foreground flex items-center opacity-50 cursor-not-allowed"
              disabled
            >
              <FiRefreshCw size={18} />
            </button>
          </div>
          <div className="mt-4">
            <FrogGridSkeleton count={skeletonCount} />
          </div>
        </div>
      ) : (
        <FrogControls initialFrogs={frogs} total={frogs.length} initialMetadata={metadata} />
      )}
    </div>
  );
}
