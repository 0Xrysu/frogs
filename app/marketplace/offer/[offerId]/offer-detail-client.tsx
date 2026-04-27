'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/Footer';
import { FiCopy, FiCheck, FiArrowRight, FiExternalLink } from 'react-icons/fi';
import { OfferDetailSkeleton, FooterSkeleton } from '@/components/SkeletonLoader';
import { useWalletConnect, ChiaMethod } from '@/contexts/WalletConnectContext';
import { useGoby } from '@/contexts/GobyContext';

interface NftData { data_uris: string[]; metadata_uris: string[]; }
interface Preview { tiny: string; medium: string; }
interface Collection { id: string; name?: string; }
interface OfferItem {
  id: string; code: string; name: string; amount?: number;
  preview?: Preview; nft_data?: NftData; collection?: Collection; is_nft?: boolean;
}
interface Offer {
  id: string; status: number; offer: string; price: number;
  offered: OfferItem[]; requested: OfferItem[];
  date_found: string; date_completed?: string; date_pending?: string; spent_block_index?: number | null;
}

const STATUS_MAP: Record<number, { label: string; color: string }> = {
  0: { label: 'Open', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
  1: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' },
  2: { label: 'Cancelling', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' },
  3: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
  4: { label: 'Completed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  6: { label: 'Expired', color: 'bg-muted text-muted-foreground' },
};

const formatNumber = (num: number): string => {
  if (num === 0) return '0';
  if (num > 0 && num < 0.0001) { const exp = Math.floor(Math.log10(num)); return `${(num / Math.pow(10, exp)).toFixed(1)}e${exp}`; }
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  if (num >= 1) return num % 1 === 0 ? num.toString() : num.toFixed(2);
  return parseFloat(num.toFixed(4)).toString();
};

const formatAmount = (item: OfferItem): string => {
  const code = item.code || item.name || 'Token';
  return item.amount === undefined ? code : `${formatNumber(item.amount)} ${code}`;
};

const isNft = (item: OfferItem): boolean => !!item.is_nft || !!item.preview || !!item.nft_data;
const getItemImage = (item: OfferItem): string | null => item.preview?.tiny || item.nft_data?.data_uris?.[0] || null;

// Detect if offer is a Sell (offering NFT) or Bid (requesting NFT)
type OfferType = 'sell' | 'bid';

const COLLECTION_ID = '7fe95fcb8b9de1f043afbceefa582471b7e55e01aef34c5ba8b390f78079640d';

const getOfferType = (offer: Offer): OfferType => {
  const offeredNft = offer.offered?.find(item => isNft(item) && item.collection?.id === COLLECTION_ID);
  const requestedNft = offer.requested?.find(item => isNft(item) && item.collection?.id === COLLECTION_ID);
  
  if (offeredNft) return 'sell';
  if (requestedNft) return 'bid';
  return 'bid';
};

const formatDateTime = (dateString: string | undefined): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

interface OfferDetailClientProps {
  offerId: string;
}

export default function OfferDetailClient({ offerId }: OfferDetailClientProps) {
  const router = useRouter();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [takeOfferState, setTakeOfferState] = useState<'idle' | 'confirming' | 'cancelled' | 'success'>('idle');

  const { isConnected: wcConnected, request: wcRequest, setShowModal } = useWalletConnect();
  const { isConnected: gobyConnected, takeOffer: gobyTakeOffer } = useGoby();
  const isWalletConnected = wcConnected || gobyConnected;

  const handleTakeOffer = async () => {
    if (!offer) return;
    
    if (!isWalletConnected) {
      setShowModal(true);
      return;
    }

    setTakeOfferState('confirming');

    try {
      if (gobyConnected) {
        await gobyTakeOffer(offer.offer);
      } else if (wcConnected) {
        await wcRequest(ChiaMethod.TakeOffer, { offer: offer.offer, fee: 0 });
      }
      
      setTakeOfferState('success');
      setTimeout(() => {
        router.push('/marketplace');
      }, 1000);
    } catch {
      setTakeOfferState('cancelled');
      setTimeout(() => {
        setTakeOfferState('idle');
      }, 1500);
    }
  };

  useEffect(() => {
    if (!offerId) return;
    const fetchOffer = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://api.dexie.space/v1/offers/${offerId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.offer) setOffer(data.offer);
          else setError('Offer not found');
        } else {
          setError('Failed to fetch offer');
        }
      } catch {
        setError('Error loading offer');
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();
  }, [offerId]);

  const handleCopy = async () => {
    if (!offer) return;
    try {
      await navigator.clipboard.writeText(offer.offer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const renderItems = (items: OfferItem[], alignRight = false) => {
    if (items.length === 0) return <span className="text-sm text-muted-foreground">-</span>;
    return (
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.id} className={`flex items-center gap-2 min-w-0 ${alignRight ? 'justify-end text-right' : ''}`}>
            {isNft(item) ? (
              <>
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 relative rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={getItemImage(item) || '/placeholder.png'}
                    alt={item.name || 'NFT'}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.png'; }}
                  />
                </div>
                <span className="text-sm lg:text-base text-foreground truncate overflow-hidden max-w-full">
                  {item.name || 'NFT'}
                </span>
              </>
            ) : (
              <span className="text-sm text-foreground font-medium truncate overflow-hidden max-w-full">
                {formatAmount(item)}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="w-20 h-6 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <OfferDetailSkeleton />
        <FooterSkeleton />
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <button
              onClick={() => router.push('/marketplace')}
              className="text-muted-foreground hover:text-foreground inline-block text-lg"
            >
              ← Back
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">{error || 'Offer not found'}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push('/marketplace')}
            className="text-muted-foreground hover:text-foreground inline-block text-lg"
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="flex-1">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="p-4 bg-muted rounded-lg mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Offered</div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Requested</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-0 flex flex-col justify-center">{renderItems(offer.offered || [])}</div>
              <div className="shrink-0 self-center"><FiArrowRight className="text-muted-foreground" size={20} /></div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">{renderItems(offer.requested || [], true)}</div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="pb-4">
              <p className="text-sm font-semibold text-muted-foreground mb-1">Status</p>
              <div className="flex items-center gap-2">
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                  getOfferType(offer) === 'sell' 
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' 
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                }`}>
                  {getOfferType(offer) === 'sell' ? 'Ask' : 'Bid'}
                </span>
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${STATUS_MAP[offer.status]?.color || 'bg-muted text-muted-foreground'}`}>
                  {STATUS_MAP[offer.status]?.label || 'Unknown'}
                </span>
              </div>
            </div>
            <div className="pb-4">
              <p className="text-sm font-semibold text-muted-foreground mb-1">Created</p>
              <p className="text-lg text-foreground">{formatDateTime(offer.date_found)}</p>
            </div>
            {offer.date_completed && (
              <div className="pb-4">
                <p className="text-sm font-semibold text-muted-foreground mb-1">Completed</p>
                <p className="text-lg text-foreground">{formatDateTime(offer.date_completed)}</p>
              </div>
            )}
            <div className="pb-4">
              <p className="text-sm font-semibold text-muted-foreground mb-1">Offer File</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-muted px-3 py-2 rounded-lg text-foreground overflow-x-auto">
                  {offer.offer}
                </code>
                <button
                  onClick={handleCopy}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors shrink-0"
                >
                  {copied ? <FiCheck size={18} className="text-green-600" /> : <FiCopy size={18} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              {/* Take Offer - Only for Open status (white box style, always on top) */}
              {offer.status === 0 && (
                <button
                  onClick={handleTakeOffer}
                  disabled={takeOfferState === 'confirming' || takeOfferState === 'success'}
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white hover:bg-gray-100 dark:bg-muted dark:hover:bg-muted/80 text-foreground border border-border rounded-lg transition-colors text-sm font-medium disabled:opacity-70"
                >
                  {takeOfferState === 'idle' && 'Take Offer'}
                  {takeOfferState === 'confirming' && 'Confirm in Wallet...'}
                  {takeOfferState === 'cancelled' && 'Cancelled'}
                  {takeOfferState === 'success' && 'Success'}
                </button>
              )}
              {/* View Block - For Cancelled, Completed, and Expired statuses (white box style, on top) */}
              {(offer.status === 3 || offer.status === 4 || offer.status === 6) && offer.spent_block_index && (
                <a
                  href={`https://spacescan.io/block/${offer.spent_block_index}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white hover:bg-gray-100 dark:bg-muted dark:hover:bg-muted/80 text-foreground border border-border rounded-lg transition-colors text-sm font-medium"
                >
                  View Block #{offer.spent_block_index}
                  <FiExternalLink size={14} />
                </a>
              )}
              <a
                href={`https://dexie.space/offers/${offer.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                View on Dexie
                <FiExternalLink size={14} />
              </a>
              <a
                href={`https://mintgarden.io/offers/${offer.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                View on Mintgarden
                <FiExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
