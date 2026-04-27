import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://frogs.ink';

export const metadata: Metadata = {
  title: {
    absolute: 'Frogs - Submit New Frog',
  },
  description: 'Submit a new frog species to the pixel art archive',
  openGraph: {
    title: 'Frogs - Submit New Frog',
    description: 'Submit a new frog species to the pixel art archive',
    url: `${baseUrl}/add`,
    type: 'website',
    images: [
      {
        url: `${baseUrl}/og.png`,
        width: 1200,
        height: 630,
        alt: 'Frogs - Submit New Frog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frogs - Submit New Frog',
    description: 'Submit a new frog species to the pixel art archive',
    images: [`${baseUrl}/og.png`],
  },
};

export default function AddLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
