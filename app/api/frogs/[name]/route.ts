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
        { error: 'Frog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      name: metadata.name,
      image: metadata.image,
      created_at: metadata.created_at,
    });
  } catch (error) {
    console.error('Error fetching frog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch frog' },
      { status: 500 }
    );
  }
}
