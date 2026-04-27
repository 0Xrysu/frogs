import { NextResponse } from 'next/server';

const API_DOCUMENTATION = {
  title: 'API',
  baseUrl: '/api',
  description: 'Frogs API with lightweight and full metadata endpoints',

  endpoints: [
    {
      method: 'GET',
      path: '/frogs',
      description: 'Get lightweight list of all frogs (for UI display)',
      response: {
        total: 'Count',
        frogs: [
          {
            name: 'Frog Name',
            image: 'ipfs-url',
            created_at: 'YYYY-MM-DD'
          }
        ]
      },
      errors: [
        { code: 500, message: 'Failed to fetch frogs' }
      ]
    },
    {
      method: 'GET',
      path: '/frogs/[name]',
      description: 'Get lightweight frog data by name',
      params: {
        name: 'URL-encoded frog name'
      },
      response: {
        name: 'Frog Name',
        image: 'ipfs-url',
        created_at: 'YYYY-MM-DD'
      },
      errors: [
        { code: 404, message: 'Frog not found' },
        { code: 500, message: 'Failed to fetch frog' }
      ]
    },
    {
      method: 'POST',
      path: '/frogs/add',
      description: 'Add new frog (image + metadata)',
      requestBody: 'multipart/form-data',
      params: {
        image: 'Image file',
        data: 'JSON metadata'
      },
      response: {
        success: true,
        name: 'frog-name'
      },
      errors: [
        { code: 400, message: 'No image provided' },
        { code: 500, message: 'Failed to upload frog' }
      ]
    },   
    {
      method: 'GET',
      path: '/metadata',
      description: 'Get full metadata for all frogs (CHIP-0007)',
      response: {
        total: 'Count',
        metadata: [
          {
           format: 'CHIP-0007',
           minting_tool: 'Frogs Lab',
           sensitive_content: false,
           name: 'Frog Name',
           description: '...',
           image: 'ipfs-url',
           attributes: [],
           collection: {
           name: 'Frogs',
           id: 'uuid',
           attributes: []
          },
           created_at: 'YYYY-MM-DD'
          }
        ]
      },
      errors: [
        { code: 500, message: 'Failed to fetch metadata' }
      ]
    },
    {
      method: 'GET',
      path: '/metadata/[name]',
      description: 'Get full metadata for specific frog',
      params: {
        name: 'URL-encoded frog name'
      },
      response: {
        format: 'CHIP-0007',
        minting_tool: 'Frogs Lab',
        sensitive_content: false,
        name: 'Frog Name',
        description: '...',
        image: 'ipfs-url',
        attributes: [],
        collection: {
        name: 'Frogs',
        id: 'uuid',
        attributes: []
       },
        created_at: 'YYYY-MM-DD'
      },
      errors: [
        { code: 404, message: 'Metadata not found' },
        { code: 500, message: 'Failed to fetch metadata' }
      ]
    },
    {
      method: 'GET',
      path: '/images',
      description: 'List all frog images',
      response: {
        total: 'Count',
        images: [
          {
            url: 'ipfs-url',
            filename: 'frog-name.png'
          }
        ]
      },
      errors: [
        { code: 500, message: 'Failed to fetch images' }
      ]
    },
    {
      method: 'GET',
      path: '/images/[name]',
      description: 'Get specific frog image',
      params: {
        name: 'URL-encoded frog name'
      },
      response: {
        url: 'ipfs-url',
        filename: 'frog-name.png'
      },
      errors: [
        { code: 400, message: 'Frog name not provided' },
        { code: 404, message: 'Image not found' },
        { code: 500, message: 'Failed to fetch image' }
      ]
    },
    {
      method: 'GET',
      path: '/docs',
      description: 'Get API documentation'
    },
    {
      method: 'GET',
      path: '/health',
      description: 'Check API health status',
      response: {
        status: 'ok',
        timestamp: 'ISO string'
      }
    }
  ],

  notes: {
    architecture: 'frogs = lightweight (UI), metadata = full NFT data',
    frogName: 'Lowercase, hyphen-separated',
    imageStorage: 'Pinata Cloud (images/)',
    metadataStorage: 'Pinata Cloud (metadata/)',
    standard: 'CHIP-0007 metadata compatible',
    iucnStatus: 'EX, EW, CR, EN, VU, NT, LC'
  }
};

export async function GET() {
  return NextResponse.json(API_DOCUMENTATION);
}
