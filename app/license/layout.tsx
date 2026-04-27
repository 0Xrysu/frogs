import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://frogs.ink';

export const metadata: Metadata = {
  title: {
  absolute: 'Frogs - License Agreement',
  },
  description: 'This artwork is dedicated to the public domain under CC0. There are no rights reserved.',
  openGraph: {
    title: 'Frogs - License Agreement',
    description: 'This artwork is dedicated to the public domain under CC0. There are no rights reserved.',
    url: `${baseUrl}/license`,
    type: 'website',
    images: [
      {
        url: `${baseUrl}/og.png`,
        width: 1200,
        height: 630,
        alt: 'Frogs - License Agreement',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frogs - License Agreement',
    description: 'This artwork is dedicated to the public domain under CC0. There are no rights reserved.',
    images: [`${baseUrl}/og.png`],
  },
};

export default function LicenseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
