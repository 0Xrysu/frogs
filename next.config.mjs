/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: '*.mypinata.cloud',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.mainnet.mintgarden.io',
      },
      {
        protocol: 'https',
        hostname: '*.ipfs.nftstorage.link',
      },
      {
        protocol: 'https',
        hostname: 'nftstorage.link',
      },
    ],
  },
}

export default nextConfig
