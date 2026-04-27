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
