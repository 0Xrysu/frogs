import { NextRequest, NextResponse } from 'next/server';
import { getFrogImage } from '@/lib/pinata';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    // Resolve the frog name from params
    const { name } = await params;
    if (!name) {
      return NextResponse.json({ error: 'Frog name not provided' }, { status: 400 });
    }

    // Check if only URL is requested (for client-side use)
    const { searchParams } = new URL(request.url);
    const urlOnly = searchParams.get('url') === 'true';

    // Get the image data from Pinata
    const imageBlob = await getFrogImage(name);
    
    if (!imageBlob) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // If only URL is requested, return JSON with the Pinata URL
    if (urlOnly) {
      return NextResponse.json({ url: imageBlob.url });
    }

    // Fetch the actual image content from Pinata gateway
    const res = await fetch(imageBlob.url, {
      headers: {
        'Accept': 'image/*',
      },
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch image from Pinata' }, { status: 500 });
    }

    const arrayBuffer = await res.arrayBuffer();
    const contentType = res.headers.get('Content-Type') || 'image/png';

    // Return the image data with proper headers for social media crawlers
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
  }
}
