'use client';

import { useState, useRef, useEffect } from 'react';
import { Share, Facebook, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MOBILE_BREAKPOINT = 768;

// X (Twitter) new logo component
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

interface ShareButtonProps {
  title: string;
  description?: string;
  imageUrl?: string;
}

export function ShareButton({ title, description, imageUrl }: ShareButtonProps) {
  // Initialize with null to indicate "not yet determined"
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  
  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Auto-detect slide direction based on button position on screen
  useEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const screenMiddle = window.innerWidth / 2;
      // If button is on left side of screen, slide right; otherwise slide left
      setSlideDirection(rect.left < screenMiddle ? 'right' : 'left');
    }
  }, [showMenu]);

  // Handle window resize to recalculate direction
  useEffect(() => {
    const handleResize = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const screenMiddle = window.innerWidth / 2;
        setSlideDirection(rect.left < screenMiddle ? 'right' : 'left');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const handleWebShare = async () => {
    if (!navigator.share) return;
    
    setIsSharing(true);
    
    try {
      const shareData: ShareData = {
        title: title,
        text: description || `Check out this ${title} pixel frog 🐸`,
        url: window.location.href,
      };

      if (imageUrl && navigator.canShare) {
        try {
          const response = await fetch(imageUrl);
          if (response.ok) {
            const blob = await response.blob();
            const file = new File([blob], `${title}.png`, { type: 'image/png' });
            
            if (navigator.canShare({ files: [file] })) {
              shareData.files = [file];
            }
          }
        } catch (imageError) {
          console.log('Could not fetch image for share, continuing without it');
        }
      }

      await navigator.share(shareData);
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleToggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowMenu(false);
      }, 1000);
    } catch (error) {
      console.error('Error copying:', error);
    }
  };

  const shareUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';
  const shareText = encodeURIComponent(description || `Check out this ${title} pixel frog 🐸`);

  const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;

  // Show loading state while determining mobile/desktop
  if (isMobile === null) {
    return (
      <Button
        size="icon"
        variant="secondary"
        className="rounded-full shadow-lg"
        disabled
      >
        <Share className="w-5 h-5" />
      </Button>
    );
  }

  // Mobile: use native share with image
  if (isMobile && typeof navigator !== 'undefined' && navigator.share) {
    return (
      <Button
        onClick={handleWebShare}
        size="icon"
        variant="secondary"
        className="rounded-full shadow-lg hover:shadow-xl transition-shadow"
        title="Share"
        disabled={isSharing}
      >
        <Share className={`w-5 h-5 ${isSharing ? 'animate-pulse' : ''}`} />
      </Button>
    );
  }

  // Menu items component
  const MenuItems = () => (
    <>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-secondary hover:bg-secondary/80 rounded-full transition-colors shadow-lg"
        title="Share on X"
        onClick={() => setShowMenu(false)}
      >
        <XIcon className="w-5 h-5" />
      </a>
      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-secondary hover:bg-secondary/80 rounded-full transition-colors shadow-lg"
        title="Share on Facebook"
        onClick={() => setShowMenu(false)}
      >
        <Facebook className="w-5 h-5" />
      </a>
      <button
        onClick={handleCopyLink}
        className="p-2 bg-secondary hover:bg-secondary/80 rounded-full transition-colors shadow-lg"
        title={copied ? 'Copied!' : 'Copy link'}
      >
        {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
      </button>
    </>
  );

  // Desktop: horizontal sliding menu with icons only - auto-detect direction
  return (
    <div className="relative flex items-center" ref={containerRef}>
      {/* Menu items - slide left (appear to the left of the button) */}
      {slideDirection === 'left' && (
        <div 
          className={`flex items-center gap-1 overflow-hidden transition-all duration-300 ease-out ${
            showMenu ? 'max-w-48 opacity-100 mr-2' : 'max-w-0 opacity-0 mr-0'
          }`}
        >
          <MenuItems />
        </div>
      )}

      {/* Share button */}
      <Button
        ref={buttonRef}
        onClick={handleToggleMenu}
        size="icon"
        variant="secondary"
        className="rounded-full shadow-lg hover:shadow-xl transition-shadow"
        title="Share"
      >
        <Share className="w-5 h-5" />
      </Button>

      {/* Menu items - slide right (appear to the right of the button) */}
      {slideDirection === 'right' && (
        <div 
          className={`flex items-center gap-1 overflow-hidden transition-all duration-300 ease-out ${
            showMenu ? 'max-w-48 opacity-100 ml-2' : 'max-w-0 opacity-0 ml-0'
          }`}
        >
          <MenuItems />
        </div>
      )}
    </div>
  );
}
