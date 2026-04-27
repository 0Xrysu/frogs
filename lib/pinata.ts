const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs';
const PINATA_API = 'https://api.pinata.cloud';

// Helper to fetch with retry and rate limit handling
async function fetchWithRetry(url: string, options?: RequestInit, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(url, options);
    
    if (response.status === 429) {
      // Rate limited - wait and retry with exponential backoff
      const waitTime = Math.pow(2, i) * 1000; // 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, waitTime));
      continue;
    }
    
    return response;
  }
  
  // Final attempt
  return fetch(url, options);
}

// Batch fetch with concurrency limit to avoid rate limiting
async function fetchInBatches<T, R>(
  items: T[],
  fetchFn: (item: T) => Promise<R | null>,
  batchSize = 20, 
  delayBetweenBatches = 75
): Promise<(R | null)[]> {
  const results: (R | null)[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fetchFn));
    results.push(...batchResults);
    
    // Add delay between batches to avoid rate limiting
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }
  
  return results;
}

function getPinataJwt(): string {
  const jwt = (process.env.PINATA_JWT || '').trim();
  if (!jwt) {
    throw new Error('PINATA_JWT environment variable is not set');
  }
  return jwt;
}

function sanitize(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

interface PinataFile {
  id: string;
  ipfs_pin_hash: string;
  size: number;
  user_id: string;
  date_pinned: string;
  date_unpinned: string | null;
  metadata: {
    name: string;
    keyvalues: Record<string, string>;
  };
}

interface PinataListResponse {
  rows: PinataFile[];
}

// Fetch ALL pinned files from Pinata (handles pagination)
async function getPinnedFiles(): Promise<PinataFile[]> {
  let allFiles: PinataFile[] = [];
  let page = 1;
  let hasMore = true;
  const pageSize = 100;

  while (hasMore) {
    const response = await fetch(`${PINATA_API}/data/pinList?status=pinned&pageLimit=${pageSize}&pageOffset=${(page - 1) * pageSize}`, {
      headers: {
        'Authorization': `Bearer ${getPinataJwt()}`,
      },
      next: { revalidate: false, tags: ['frogs'] },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch files from Pinata: ${error}`);
    }

    const data: PinataListResponse = await response.json();
    allFiles.push(...data.rows);

    // If we got less than pageSize items, it's the last page
    hasMore = data.rows.length === pageSize;
    page++;
  }

  return allFiles;
}

// Upload file to Pinata
async function uploadToPinata(file: File | Blob, filename: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file, filename);

  const metadata = JSON.stringify({ name: filename });
  formData.append('pinataMetadata', metadata);

  const response = await fetch(`${PINATA_API}/pinning/pinFileToIPFS`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getPinataJwt()}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Pinata upload failed: ${error}`);
  }

  const result = await response.json();
  return result.IpfsHash; // CID
}

export async function uploadImage(file: File, frogName: string): Promise<string> {
  const ext = file.name.split('.').pop();
  const sanitizedName = sanitize(frogName);
  const filename = `${sanitizedName}.${ext}`;

  const cid = await uploadToPinata(file, filename);
  return `${PINATA_GATEWAY}/${cid}`;
}

export async function uploadMetadata(frogName: string, metadata: Record<string, unknown>): Promise<string> {
  const sanitizedName = sanitize(frogName);
  const filename = `${sanitizedName}.json`;

  const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
  const cid = await uploadToPinata(blob, filename);
  return `${PINATA_GATEWAY}/${cid}`;
}

// List all image files
export async function listImages() {
  const files = await getPinnedFiles();

  const imageFiles = files.filter(f => {
    const name = f.metadata?.name?.trim().toLowerCase();
    return name && name.match(/\.(png|gif|jpg|jpeg|webp)$/i);
  });

  return imageFiles.map(file => ({
    pathname: `images/${file.metadata.name.trim()}`,
    url: `${PINATA_GATEWAY}/${file.ipfs_pin_hash}`,
    cid: file.ipfs_pin_hash,
  }));
}

// Get image by frog name
export async function getFrogImage(frogName: string) {
  const sanitizedName = sanitize(frogName);
  const files = await getPinnedFiles();

  const match = files.find(f => {
    const name = f.metadata?.name?.trim().toLowerCase() || '';
    const nameWithoutExt = name.replace(/\.(png|gif|jpg|jpeg|webp)$/i, '');
    return nameWithoutExt === sanitizedName && name.match(/\.(png|gif|jpg|jpeg|webp)$/i);
  });

  if (!match) return null;

  return {
    pathname: `images/${match.metadata.name.trim()}`,
    url: `${PINATA_GATEWAY}/${match.ipfs_pin_hash}`,
    cid: match.ipfs_pin_hash,
  };
}

// Fetch single metadata from IPFS
async function fetchSingleMetadata(cid: string): Promise<unknown | null> {
  try {
    const response = await fetchWithRetry(`${PINATA_GATEWAY}/${cid}`, {
      next: { revalidate: false, tags: ['frogs'] }
    });
    
    if (!response.ok) {
      console.warn('Failed to fetch metadata from IPFS:', cid, response.status);
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      console.warn('Invalid content type from IPFS:', contentType);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.warn('Error fetching metadata:', cid, err);
    return null;
  }
}

// Get metadata by frog name
export async function getFrogMetadata(frogName: string) {
  const sanitizedName = sanitize(frogName);
  const files = await getPinnedFiles();

  const match = files.find(f =>
    f.metadata?.name?.trim().toLowerCase() === `${sanitizedName}.json`
  );

  if (!match) return null;

  return fetchSingleMetadata(match.ipfs_pin_hash);
}

// Fetch ALL metadata with batching to avoid rate limits
export async function getAllFrogsMetadata(): Promise<Array<{ name: string; image: string; created_at?: string; attributes?: Array<{ trait_type: string; value: string }> }>> {
  const files = await getPinnedFiles();

  const metadataFiles = files.filter(f => {
    const name = f.metadata?.name?.trim().toLowerCase();
    return name && name.endsWith('.json');
  });

  const results = await fetchInBatches(
    metadataFiles,
    async (file) => {
      const data = await fetchSingleMetadata(file.ipfs_pin_hash);
      if (!data || typeof data !== 'object') return null;
      return data as { name: string; image: string; created_at?: string; attributes?: Array<{ trait_type: string; value: string }> };
    },
    20, 
    75
  );

  return results.filter((r): r is NonNullable<typeof r> => r !== null);
}
