import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
  default: "Frogs — Pixel Collection",
  template: "%s | Frogs",
  },
  description: "1/1 pixel art archive dedicated to the global diversity of frogs. Every specimen in this collection is a unique digital preservation of a real-world species",
  openGraph: {
    title: "Frogs — Pixel Collection",
    description: "1/1 pixel art archive dedicated to the global diversity of frogs. Every specimen in this collection is a unique digital preservation of a real-world species",
    images: ["/og.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Frogs — Pixel Collection",
    description: "1/1 pixel art archive dedicated to the global diversity of frogs. Every specimen in this collection is a unique digital preservation of a real-world species",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  metadataBase: new URL("https://frogs.ink"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
