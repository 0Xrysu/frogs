'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FrogDetailSkeleton } from '@/components/SkeletonLoader';
import { Footer } from '@/components/Footer';
import { ShareButton } from '@/components/ShareButton';
import { useFrogByName } from '@/hooks/use-frog-cache';

export default function FrogDetailClient() {
  const params = useParams();
  const slug = params.name as string;
  const decodedName = slug.replace(/-/g, ' ');

  const { frog, isLoading, error } = useFrogByName(decodedName);

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col bg-background">
        <div className="border-b border-border">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="w-16 h-6 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <FrogDetailSkeleton />
      </main>
    );
  }

  if (error || !frog) {
    return (
      <main className="min-h-screen flex flex-col bg-background">
        <div className="border-b border-border">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link href="/" className="text-muted-foreground hover:text-foreground inline-block text-lg">
              ← Back
            </Link>
          </div>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="text-muted-foreground text-lg">Frog not found</div>
        </div>
        <Footer className="animate-pulse" />
      </main>
    );
  }

  const attributesWithCreated = [{ trait_type: 'Created', value: frog.created_at }, ...(frog.attributes || [])];

  const leftColumnDesktop = attributesWithCreated.slice(0, 6);
  const rightColumnDesktop = attributesWithCreated.slice(6);

  const leftColumnMobile = attributesWithCreated.filter((_, i) => i % 2 === 0);
  const rightColumnMobile = attributesWithCreated.filter((_, i) => i % 2 === 1);

  const renderAttr = (attr: { trait_type: string; value: string }) => (
    <div key={attr.trait_type}>
      <p className="text-sm font-semibold text-muted-foreground mb-1">{attr.trait_type}</p>
      <p className="text-sm text-foreground truncate">{attr.value}</p>
    </div>
  );

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <div className="border-b border-border">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="text-muted-foreground hover:text-foreground inline-block text-lg">
            ← Back
          </Link>
        </div>
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <div className="w-full lg:w-1/2 flex">
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted">
              {frog.image && (
                <Image
                  src={frog.image}
                  alt={frog.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover w-full h-full"
                  priority
                />
              )}
              {/* Share Button - Mobile: Top Right, Desktop: Top Left */}
              <div className="absolute top-4 right-4 lg:left-4 lg:right-auto">
                <ShareButton title={frog.name} imageUrl={frog.image} />
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col h-full">
            <h1 className="heading-5xl text-foreground mb-8">{frog.name}</h1>

            {/* Desktop */}
            <div className="hidden lg:flex gap-8 flex-1">
              <div className="flex flex-col gap-y-4 w-1/2 h-full">
                {leftColumnDesktop.map(renderAttr)}
              </div>
              <div className="flex flex-col gap-y-4 w-1/2 h-full">
                {rightColumnDesktop.map(renderAttr)}
              </div>
            </div>

            {/* Mobile / Tablet */}
            <div className="flex flex-col gap-y-4 lg:hidden">
              {leftColumnMobile.map(renderAttr)}
              {rightColumnMobile.map(renderAttr)}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
