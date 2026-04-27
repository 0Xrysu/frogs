import { NextRequest, NextResponse } from 'next/server';
import { getFrogMetadata } from '@/lib/pinata';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const metadata = await getFrogMetadata(name);

    if (!metadata) {
      return NextResponse.json(
        { error: 'Metadata not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(metadata, { next: 
    { revalidate: false } });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 500 }
    );
  }
}
