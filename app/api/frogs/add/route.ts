import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, uploadMetadata } from '@/lib/pinata';
import { FrogMetadata, FrogFormData } from '@/lib/types';
import { revalidateTag } from 'next/cache';

const COLLECTION_DESCRIPTION = "1/1 pixel art archive dedicated to the global diversity of frogs. Every specimen in this collection is a unique digital preservation of a real-world species, cataloged with authentic scientific metadata to serve as a permanent ledger of Earth's Amphibia.";

export async function POST(request: NextRequest) {
  try {
    // Validate secret key from query parameters
    const secretKey = request.nextUrl.searchParams.get('key');
    const expectedKey = process.env.SECRET_KEY;

    if (!secretKey || !expectedKey || secretKey !== expectedKey) {
      return NextResponse.json({ error: 'Invalid or missing secret key' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;
    const formFields = JSON.parse(formData.get('data') as string) as FrogFormData;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Use frog name as ID
    const frogName = formFields.name;

    // Upload image to Blob with name-based filename
    const imageUrl = await uploadImage(file, frogName);

    // Get date only (YYYY-MM-DD format)
    const dateOnly = new Date().toISOString().split('T')[0];

    const metadata: FrogMetadata = {
  format: "CHIP-0007",
  minting_tool: "Frogs Lab",
  sensitive_content: false,

  name: formFields.name,
  description: COLLECTION_DESCRIPTION,
  image: imageUrl,

  attributes: [
    { trait_type: 'Background', value: formFields.background },
    { trait_type: 'Color', value: formFields.color },
    { trait_type: 'Science Name', value: formFields.scienceName },
    { trait_type: 'Origin', value: formFields.origin },
    { trait_type: 'Toxicity', value: formFields.toxicity },
    { trait_type: 'Conservation Status', value: formFields.conversation },
    { trait_type: 'Rarity Tier', value: formFields.rarityTier },
  ],

  collection: {
    name: "Frogs",
    id: "019d2026-7873-7e4d-92df-0f7297a50676",
    attributes: [
      {
        type: "description",
        value: COLLECTION_DESCRIPTION
      },
      {
        type: "icon",
        value: "https://frogs.ink/icon.png"
      },
      {
        type: "banner",
        value: "https://frogs.ink/banner.png"
      },
      {
        type: "website",
        value: "https://frogs.ink/"
      }
    ]
  },

  created_at: dateOnly,
};

    // Upload metadata to Blob
    await uploadMetadata(frogName, metadata);
    revalidateTag('frogs', 'max');

    return NextResponse.json({ 
      success: true, 
      name: frogName,
      metadata 
    }, { status: 201 });
  } catch (error) {
    console.error('Error uploading frog:', error);
    return NextResponse.json(
      { error: 'Failed to upload frog' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint with form data containing image and frog metadata to add a new frog'
  });
}
