'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function CreatorPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col font-sans">
      <Header />

      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="heading-5xl text-foreground">Creator</h1>
          <p className="text-muted-foreground mt-2">The person behind this pixel frogs collection.</p>
        </div>
      </div>

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* About Card */}
          <div className="mb-12">
            <div className="p-6 bg-muted rounded-xl border border-border">
              <h3 className="font-bold text-foreground mb-2">About</h3>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Hi, Rysuです。ペンネームで、本名はsecretです。秋田在住の高校生で、普段はschool lifeを送りながら、ものづくりしています。
                </p>
                <p>
                  Pixel artは2024年にスタート。最初は全然わからなかったけど、カエルを描いているうちに楽しくなって、今はkaeru pixel artをメインに制作しています。まだ発展途上ですが、dailyで少しずつ改善中。
                </p>
                <p>
                  すべてのfrogは1/1のhand-drawn作品です。毎日のuploadはできないけど、学校の課題の合間にコツコツ制作しています。
                </p>
                <p>
                  すべてのfrogsはChia blockchain上に保存されています。理由は、Bitcoinレベルのsecurityと、シンプルなmint process。さらにeco-friendlyで電力消費も少なく、長期的にartを安全に残せるのが魅力です。
                </p>
                <p>
                  このwebsiteは自作です。APIもpublicにしているので、自由に使ってOKです。詳しくは{' '}
                  <a href="/api" className="text-foreground hover:text-muted-foreground font-medium underline underline-offset-2">
                    API docs
                  </a>
                  {' '}を確認してください。
                </p>
                <p>
                  Frogを追加したい場合は、{' '}
                  <a href="/add" className="text-foreground hover:text-muted-foreground font-medium underline underline-offset-2">
                    Add Frog
                  </a>
                  {' '}ページから可能です（secret key required）。必要な場合はemailで連絡してください。Fast responseで対応します。
                </p>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 gap-8 mb-12">
            <div className="p-6 bg-muted rounded-xl border border-border">
              <h3 className="font-bold text-foreground mb-2">Location</h3>
              <p className="text-sm text-muted-foreground">Akita, Japan / 秋田県</p>
            </div>
            <div className="p-6 bg-muted rounded-xl border border-border">
              <h3 className="font-bold text-foreground mb-2">Started</h3>
              <p className="text-sm text-muted-foreground">2024年からpixel artを始めた</p>
            </div>
            <div className="p-6 bg-muted rounded-xl border border-border">
              <h3 className="font-bold text-foreground mb-2">Languages</h3>
              <p className="text-sm text-muted-foreground">日本語 and English OK</p>
            </div>
            <div className="p-6 bg-muted rounded-xl border border-border">
              <h3 className="font-bold text-foreground mb-2">Status</h3>
              <p className="text-sm text-muted-foreground">高校生 / High school student</p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="prose prose-sm text-muted-foreground max-w-none border-t border-border pt-8">
            <h2 className="heading-2xl text-foreground mb-4">Contact</h2>
            <p className="mb-6">
              Xはlow activityですが、emailなら返信します。
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <a
                href="mailto:0xrysu@gmail.com"
                className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-muted/80 transition-colors"
                aria-label="Send email to 0xrysu@gmail.com"
              >
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>

              <a
                href="https://github.com/0Xrysu"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-muted/80 transition-colors"
                aria-label="Visit GitHub profile 0Xrysu"
              >
                <svg className="w-5 h-5 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>

              <a
                href="https://x.com/0xrysu"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-muted/80 transition-colors"
                aria-label="Visit X profile @0xrysu"
              >
                <svg className="w-5 h-5 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
