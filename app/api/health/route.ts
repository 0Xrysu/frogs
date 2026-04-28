import { NextResponse } from 'next/server';

export async function GET() {
  let pinata = 'ok';
  let status = 'ok';
  let website = 'warm';

  try {
    const res = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      headers: { Authorization: `Bearer ${process.env.PINATA_JWT}` },
      next: { revalidate: 0 }
    });
    if (!res.ok) {
      pinata = 'error';
      status = 'degraded';
      website = 'degraded';
    }
  } catch {
    pinata = 'unreachable';
    status = 'down';
    website = 'down';
  }

  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0];

  return NextResponse.json(
    {
      status,
      website,
      pinata,
      edge: 'cloudflare',
      cache: `${date} ${time}`,
    },
    { status: status === 'ok' ? 200 : 503 }
  );
}
