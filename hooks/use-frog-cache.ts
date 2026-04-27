'use client';

import useSWR, { mutate } from 'swr';
import { FrogMetadata } from '@/lib/types';

interface FrogMetadataItem {
  name: string;
  image: string;
  description?: string;
  created_at?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
}

// Key for storing all frogs metadata
const ALL_FROGS_KEY = 'all-frogs-metadata';

// Fetcher for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

// Hook to get all frogs metadata (used by home page)
export function useAllFrogsMetadata(initialData?: FrogMetadataItem[] | null) {
  const { data, error, isLoading } = useSWR<{ metadata: FrogMetadataItem[] }>(
    ALL_FROGS_KEY,
    () => fetcher('/api/metadata'),
    {
      fallbackData: initialData ? { metadata: initialData } : undefined,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 600000,
    }
  );

  return {
    metadata: data?.metadata || initialData || [],
    isLoading,
    error,
  };
}

// Hook to get a single frog by name (uses cached data first)
export function useFrogByName(name: string) {
  const { data, error, isLoading } = useSWR<FrogMetadata>(
    name ? `frog-${name.toLowerCase()}` : null,
    async () => {
      // First, try to get from the all-frogs cache
      const cachedAll = await getCachedAllFrogs();
      if (cachedAll) {
        const found = cachedAll.find(
          (f) => f.name?.toLowerCase() === name.toLowerCase()
        );
        if (found) {
          return {
            name: found.name,
            description: found.description || '',
            image: found.image,
            attributes: found.attributes || [],
            created_at: found.created_at || '',
          } as FrogMetadata;
        }
      }

      // If not in cache, fetch from API
      const res = await fetch(`/api/metadata/${encodeURIComponent(name)}`);
      if (!res.ok) throw new Error('Frog not found');
      return res.json();
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 600000,
    }
  );

  return {
    frog: data,
    isLoading,
    error,
  };
}

// Pre-populate the cache with all frogs metadata
export function populateFrogCache(metadata: FrogMetadataItem[]) {
  mutate(ALL_FROGS_KEY, { metadata }, false);
}

// Get cached all frogs (sync read from SWR cache)
async function getCachedAllFrogs(): Promise<FrogMetadataItem[] | null> {
  // Use mutate to access the cache
  return new Promise((resolve) => {
    mutate(
      ALL_FROGS_KEY,
      (current: { metadata: FrogMetadataItem[] } | undefined) => {
        resolve(current?.metadata || null);
        return current;
      },
      false
    );
  });
}

// Refresh all frogs cache
export function refreshFrogCache() {
  mutate(ALL_FROGS_KEY);
}
