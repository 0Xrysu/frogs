import { Metadata } from 'next';
import OfferDetailClient from './offer-detail-client';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://frogs.ink';

interface OfferItem {
  id: string;
  name: string;
  is_nft?: boolean;
  preview?: { tiny: string; medium: string };
  nft_data?: { data_uris: string[] };
}

interface OfferData {
  id: string;
  offered: OfferItem[];
  requested: OfferItem[];
}

// Helper to sanitize frog name (same as in pinata.ts)
function sanitize(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// Helper to get first NFT name from offer
function getFirstNftName(offer: OfferData): string | null {
  const allItems = [...(offer.offered || []), ...(offer.requested || [])];
  const nftItem = allItems.find(item => item.is_nft || item.preview || item.nft_data);
  return nftItem?.name || null;
}

export async function generateMetadata({ params }: { params: Promise<{ offerId: string }> }): Promise<Metadata> {
  const { offerId } = await params;
  
  const res = await fetch(`https://api.dexie.space/v1/offers/${offerId}`, {
    next: { revalidate: 60 },
  });
  
  const data = await res.json();
  const frogName = (data.success && data.offer) ? getFirstNftName(data.offer) : 'frog';
  const sanitizedName = sanitize(frogName || 'frog');
  
  const title = `Frogs - Trade ${frogName}`;
  const description = `View trade offer for ${frogName} on the Frogs marketplace`;
  const imageUrl = `${baseUrl}/api/images/${encodeURIComponent(sanitizedName)}`;

  return {
    title: {
      absolute: title,
    },
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: `${baseUrl}/marketplace/offer/${offerId}`,
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1200,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: title,
      description: description,
      images: [imageUrl],
    },
  };
}

export default async function OfferDetailPage({ params }: { params: Promise<{ offerId: string }> }) {
  const { offerId } = await params;
  
  return <OfferDetailClient offerId={offerId} />;
}
