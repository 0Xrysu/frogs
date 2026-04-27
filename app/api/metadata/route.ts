import { NextResponse } from 'next/server';
import { getAllFrogsMetadata } from '@/lib/pinata';

export async function GET() {
  try {
    const metadata = await getAllFrogsMetadata();

    return NextResponse.json({ total: metadata.length, metadata });
  } catch (error) {
    console.error('Error fetching metadata:', error);

    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 500 }
    );
  }
}
