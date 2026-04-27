'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { FrogForm } from '@/components/FrogForm';
import { Footer } from '@/components/Footer';

export default function AddFrogPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="heading-5xl text-foreground">Add New Frog</h1>
          <p className="text-muted-foreground mt-2">Submit a new frog to the archive</p>
        </div>
      </div>

      <div className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <FrogForm onSuccess={handleSuccess} />
        </div>
      </div>

      <Footer />
    </main>
  );
}
