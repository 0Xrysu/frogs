'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <>
      <header className="border-b border-border relative z-10 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-5xl font-bold text-foreground hover:text-muted-foreground transition-colors">
              Frogs
            </Link>

            {/* Mobile: hamburger + theme toggle */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2"
                aria-label="Toggle menu"
              >
                {isOpen ? (
                  <X className="w-6 h-6 text-foreground" />
                ) : (
                  <Menu className="w-6 h-6 text-foreground" />
                )}
              </button>
            </div>

            {/* Desktop menu */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link href="/add" className="text-foreground hover:text-muted-foreground font-medium">
                Add Frog
              </Link>
              <Link href="/marketplace" className="text-foreground hover:text-muted-foreground font-medium">
                Marketplace
              </Link>
              <Link href="/api" className="text-foreground hover:text-muted-foreground font-medium">
                API
              </Link>
              <Link href="/license" className="text-foreground hover:text-muted-foreground font-medium">
                License
              </Link>
              <Link href="/creator" className="text-foreground hover:text-muted-foreground font-medium">
                Creator
              </Link>
              {/* Desktop theme toggle — icon only */}
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-md text-foreground hover:text-muted-foreground hover:bg-muted transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Full-screen mobile menu overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-background z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-0 flex flex-col z-40 lg:hidden">
            {/* Header area */}
            <div className="border-b border-border bg-background">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-6">
                  <Link href="/" className="text-5xl font-bold text-foreground hover:text-muted-foreground transition-colors">
                    Frogs
                  </Link>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2"
                    aria-label="Close menu"
                  >
                    <X className="w-6 h-6 text-foreground" />
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation links */}
            <div className="flex-1 flex flex-col items-start pt-4 px-4 sm:px-6 lg:px-8 gap-4 bg-background">
              <nav className="flex flex-col gap-6 text-left w-full">
                <Link
                  href="/add"
                  className="text-2xl text-foreground hover:text-muted-foreground font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Add Frog
                </Link>
                <Link
                  href="/marketplace"
                  className="text-2xl text-foreground hover:text-muted-foreground font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Marketplace
                </Link>
                <Link
                  href="/api"
                  className="text-2xl text-foreground hover:text-muted-foreground font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  API
                </Link>
                <Link
                  href="/license"
                  className="text-2xl text-foreground hover:text-muted-foreground font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  License
                </Link>
                <Link
                  href="/creator"
                  className="text-2xl text-foreground hover:text-muted-foreground font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Creator
                </Link>

                {/* Mobile theme toggle — text button */}
                {mounted && (
                  <button
                    onClick={() => { toggleTheme(); setIsOpen(false); }}
                    className="text-2xl text-foreground hover:text-muted-foreground font-medium text-left"
                  >
                    {theme === 'dark' ? 'Day Theme' : 'Night Theme'}
                  </button>
                )}
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
}
