import { Metadata } from 'next';
import { WalletConnectProvider } from '@/contexts/WalletConnectContext';
import { GobyProvider } from '@/contexts/GobyContext';
import { WalletSelectModal } from '@/components/WalletSelectModal';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://frogs.ink';

export const metadata: Metadata = {
  title: {
    absolute: 'Frogs - Marketplace',
  },
  description: 'Browse and discover unique frog offers on Chia. Find your perfect amphibian companion.',
  openGraph: {
    title: 'Frogs - Marketplace',
    description: 'Browse and discover unique frog offers on Chia. Find your perfect amphibian companion.',
    url: `${baseUrl}/marketplace`,
    type: 'website',
    images: [
      {
        url: `${baseUrl}/og.png`,
        width: 1200,
        height: 630,
        alt: 'Frogs - Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frogs - Marketplace',
    description: 'Browse and discover unique frog offers on Chia. Find your perfect amphibian companion.',
    images: [`${baseUrl}/og.png`],
  },
};

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GobyProvider>
      <WalletConnectProvider>
        {children}
        <WalletSelectModal />
      </WalletConnectProvider>
    </GobyProvider>
  );
}
