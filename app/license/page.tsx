'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function LicensePage() {
  return (
    <main className="min-h-screen bg-background flex flex-col font-sans">
      <Header />

      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="heading-5xl text-foreground">License</h1>
          <p className="text-muted-foreground mt-2">This artwork is dedicated to the public domain. There are no rights reserved.</p>
        </div>
      </div>

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 gap-8 mb-12">
            <div className="p-6 bg-muted rounded-xl border border-border">
              <h3 className="font-bold text-foreground mb-2">Open to All</h3>
              <p className="text-sm text-muted-foreground">Anyone can copy, modify, or distribute the artwork, even for commercial purposes.</p>
            </div>
            <div className="p-6 bg-muted rounded-xl border border-border">
              <h3 className="font-bold text-foreground mb-2">Open API</h3>
              <p className="text-sm text-muted-foreground">Access real-time frog metadata and scientific taxonomy via our public{' '}
                <a
                  href="https://frogs.ink/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium underline underline-offset-2"
                >
                  API Docs
                </a>
              </p>
            </div>
            <div className="p-6 bg-muted rounded-xl border border-border">
              <h3 className="font-bold text-foreground mb-2">No Permission Needed</h3>
              <p className="text-sm text-muted-foreground">Users do not need to ask for consent or provide attribution (though it is appreciated).</p>
            </div>
            <div className="p-6 bg-muted rounded-xl border border-border">
              <h3 className="font-bold text-foreground mb-2">Ownership</h3>
              <p className="text-sm text-muted-foreground">Collectors own the specific token, but the underlying imagery belongs to the world.</p>
            </div>
          </div>

          <div className="prose prose-sm text-muted-foreground max-w-none border-t border-border pt-8">
            <h2 className="heading-2xl text-foreground mb-4">The Creative Commons Zero (CC0) Deed</h2>
            <p className="mb-4">
              The creator of the Artwork associated with this NFT has dedicated the work to the public domain by waiving all of his or her rights to the work worldwide under copyright law, including all related and neighboring rights, to the extent allowed by law.
            </p>
            <p className="mb-6">
              You can copy, modify, distribute and perform the work, even for commercial purposes, all without asking permission.
            </p>

            <a
              href="https://creativecommons.org/publicdomain/zero/1.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium underline underline-offset-4"
            >
              View the Full CC0 Legal Code
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-4-4l6-6m0 0V4m0 6H10" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
