import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://frogs.ink';

export const metadata: Metadata = {
  title: {
    absolute: 'Frogs - Creator',
  },
  description: 'The person behind this pixel frogs collection.',
  openGraph: {
    title: 'Frogs - Creator',
    description: 'The person behind this pixel frogs collection.',
    url: `${baseUrl}/creator`,
    type: 'website',
    images: [
      {
        url: `${baseUrl}/og.png`,
        width: 1200,
        height: 630,
        alt: 'Frogs - Creator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frogs - Creator',
    description: 'The person behind this pixel frogs collection.',
    images: [`${baseUrl}/og.png`],
  },
};

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
