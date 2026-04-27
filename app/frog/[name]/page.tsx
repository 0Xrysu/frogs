import { Metadata } from 'next';
import FrogDetailClient from './frog-detail-client';

// Helper to sanitize frog name (same as in pinata.ts)
function sanitize(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params;
  const decodedName = (name as string).replace(/-/g, ' ');

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://frogs.ink';
  const url = `${baseUrl}/frog/${name}`;

  // Format title: "Frogs - Golden Poison"
  const frogTitle = decodedName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  const title = `Frogs - ${frogTitle}`;
  const description = `Check out this ${frogTitle} pixel frog 🐸`;
  const sanitizedName = sanitize(decodedName);
  const imageUrl = `${baseUrl}/api/images/${encodeURIComponent(sanitizedName)}`;

  return {
    title: {
      absolute: title,
    },
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1200,
          alt: frogTitle,
        },
      ],
      url: url,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: title,
      description: description,
      images: [imageUrl],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default function FrogDetailPage() {
  return <FrogDetailClient />;
}
