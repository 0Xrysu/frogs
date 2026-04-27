'use client';

export function FrogCardSkeleton() {
  return (
    <div className="aspect-square bg-muted rounded-lg animate-pulse" />
  );
}

export function FrogGridSkeleton({ count = 16 }) {
  return (
    <div className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10 gap-4">
      {[...Array(count)].map((_, i) => (
        <FrogCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function FrogDetailSkeleton() {
  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Image skeleton */}
        <div className="w-full lg:w-1/2">
          <div className="w-full aspect-square bg-muted rounded-lg animate-pulse" />
        </div>

        {/* Content skeleton */}
        <div className="w-full lg:w-1/2 flex flex-col">
          {/* Title */}
          <div className="h-12 bg-muted rounded animate-pulse mb-8 w-3/4" />

          {/* Desktop: Two columns */}
          <div className="hidden lg:flex gap-8 flex-1">
            <div className="flex flex-col gap-y-4 w-1/2">
              {[...Array(6)].map((_, i) => (
                <div key={i}>
                  <div className="h-3 bg-muted rounded w-1/2 animate-pulse mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-y-4 w-1/2">
              {[...Array(6)].map((_, i) => (
                <div key={i}>
                  <div className="h-3 bg-muted rounded w-1/2 animate-pulse mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: Single column */}
          <div className="flex flex-col gap-y-4 lg:hidden">
            {[...Array(12)].map((_, i) => (
              <div key={i}>
                <div className="h-3 bg-muted rounded w-1/3 animate-pulse mb-2" />
                <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ApiDocsSkeleton() {
  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="mb-12">
        <div className="h-8 bg-muted rounded w-32 animate-pulse mb-4" />
        <div className="h-12 bg-muted rounded animate-pulse" />
      </div>
      <div className="mb-12">
        <div className="h-8 bg-muted rounded w-32 animate-pulse mb-6" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="mb-8 border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-14 bg-muted rounded animate-pulse" />
              <div className="h-6 bg-muted rounded w-32 animate-pulse" />
            </div>
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse mb-4" />
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-24 animate-pulse" />
              <div className="h-20 bg-muted rounded animate-pulse" />
            </div>
            <div className="mt-4">
              <div className="h-8 w-20 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <div className="mb-12">
        <div className="h-8 bg-muted rounded w-64 animate-pulse mb-4" />
        <div className="border border-border rounded overflow-hidden">
          <div className="h-10 bg-muted animate-pulse" />
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-10 bg-muted/50 border-t border-border animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function MarketplaceSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
          </div>
          <div className="flex items-center gap-4 mb-2">
            <div className="flex-1">
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
            </div>
            <div className="w-5" />
            <div className="flex-1 flex justify-end">
              <div className="h-3 w-20 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 flex items-center gap-2">
              <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            </div>
            <div className="w-5 h-5 bg-muted rounded animate-pulse" />
            <div className="flex-1 flex items-center gap-2 justify-end">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function OfferDetailSkeleton() {
  return (
    <div className="flex-1">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="p-4 bg-muted rounded-lg mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="h-3 w-16 bg-muted-foreground/20 rounded animate-pulse" />
            <div className="h-3 w-20 bg-muted-foreground/20 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 flex items-center gap-2">
              <div className="w-10 h-10 bg-muted-foreground/20 rounded-lg animate-pulse" />
              <div className="h-4 w-24 bg-muted-foreground/20 rounded animate-pulse" />
            </div>
            <div className="w-5 h-5 bg-muted-foreground/20 rounded animate-pulse" />
            <div className="flex-1 flex items-center gap-2 justify-end">
              <div className="h-4 w-20 bg-muted-foreground/20 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="pb-4">
            <div className="h-4 w-16 bg-muted rounded animate-pulse mb-2" />
            <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
          </div>
          <div className="pb-4">
            <div className="h-4 w-16 bg-muted rounded animate-pulse mb-2" />
            <div className="h-6 w-40 bg-muted rounded animate-pulse" />
          </div>
          <div className="pb-4">
            <div className="h-4 w-20 bg-muted rounded animate-pulse mb-2" />
            <div className="h-10 bg-muted rounded-lg animate-pulse" />
          </div>
          <div className="flex flex-col gap-3 pt-4">
            <div className="h-12 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FooterSkeleton() {
  return (
    <footer className="border-t border-border py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="h-4 w-48 bg-muted rounded animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="h-5 w-5 bg-muted rounded animate-pulse" />
            <div className="h-5 w-5 bg-muted rounded animate-pulse" />
            <div className="h-5 w-5 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    </footer>
  );
}
