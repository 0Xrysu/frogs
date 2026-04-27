import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { HomeContent } from '@/components/HomeContent';

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />
      <div>
        <HomeContent />
      </div>
      <Footer />
    </main>
  );
}
