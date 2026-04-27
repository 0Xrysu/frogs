export const runtime = 'edge';

import { NextResponse } from 'next/server';

export function GET() {
  const now = new Date();

  const date = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0');

  return NextResponse.json({
    status: 'ok',
    date
  });
}
