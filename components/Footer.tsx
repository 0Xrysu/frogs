'use client';

export function Footer({ className }: { className?: string }) {
  const year = new Date().getFullYear();

  return (
    <footer className={`border-t border-border mt-auto ${className ?? ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-muted-foreground">
        Frogs © {year} No Rights Reserved
      </div>
    </footer>
  );
}
