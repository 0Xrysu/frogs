import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://frogs.ink';

export const metadata: Metadata = {
  title: {
    absolute: 'Frogs - API Docs',
  },
  description: 'API documentation for the Frogs pixel art collection',
  openGraph: {
    title: 'Frogs - API Docs',
    description: 'API documentation for the Frogs pixel art collection',
    url: `${baseUrl}/api`,
    type: 'website',
    images: [
      {
        url: `${baseUrl}/og.png`,
        width: 1200,
        height: 630,
        alt: 'Frogs - API Docs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frogs - API Docs',
    description: 'API documentation for the Frogs pixel art collection',
    images: [`${baseUrl}/og.png`],
  },
};

export default function ApiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
