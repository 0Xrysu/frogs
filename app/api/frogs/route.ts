import { NextResponse } from 'next/server';
import { getAllFrogsMetadata } from '@/lib/pinata';

export async function GET() {
  try {
    const frogs = await getAllFrogsMetadata();

    return NextResponse.json({
      total: frogs.length,
      frogs: frogs.map(f => ({
        name: f.name,
        image: f.image,
        created_at: f.created_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching frogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch frogs' },
      { status: 500 }
    );
  }
}
