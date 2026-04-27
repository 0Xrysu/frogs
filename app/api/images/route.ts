import { NextResponse } from 'next/server';
import { listImages } from '@/lib/pinata';

export async function GET() {
  try {
    const blobs = await listImages();

    if (!blobs) {
      return NextResponse.json(
        { error: 'Failed to fetch images' },
        { status: 500 }
      );
    }

    const images = blobs.map(blob => ({
      url: blob.url,
      filename: blob.pathname.split('/').pop(),
    }));

    return NextResponse.json({ total: images.length, images });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}
