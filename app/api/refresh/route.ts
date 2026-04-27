import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST() {
  try {
    // Revalidate the 'frogs' tag with 'max' cacheLife profile (Next.js 16 requirement)
    revalidateTag('frogs', 'max');
    
    // Also revalidate the page paths
    revalidatePath('/');
    revalidatePath('/api/frogs');
    revalidatePath('/api/metadata');
    
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Error revalidating:', e);
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
