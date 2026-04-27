'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FiFilter, FiRefreshCw, FiChevronDown, FiArrowRight } from 'react-icons/fi';
import { LuWallet } from 'react-icons/lu';
import { useWalletConnect } from '@/contexts/WalletConnectContext';
import { MarketplaceSkeleton } from '@/components/SkeletonLoader';

interface NftData { data_uris: string[]; metadata_uris: string[]; data_hash?: string; metadata_hash?: string; }
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
interface ApiResponse { success: boolean; count: number; page: number; page_size: number; page_count: number; offers: Offer[]; }

const STATUS_MAP: Record<number, { label: string; color: string }> = {
  0: { label: 'Open', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
  1: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' },
  2: { label: 'Cancelling', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' },
  3: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
  4: { label: 'Completed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  6: { label: 'Expired', color: 'bg-muted text-muted-foreground' },
};

const FILTER_OPTIONS = [
  { status: 0, label: 'Open' }, { status: 1, label: 'Pending' },
  { status: 2, label: 'Cancelling' }, { status: 3, label: 'Cancelled' },
  { status: 4, label: 'Completed' }, { status: 6, label: 'Expired' },
];

const COLLECTION_ID = '7fe95fcb8b9de1f043afbceefa582471b7e55e01aef34c5ba8b390f78079640d';

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

const isNft = (item: OfferItem): boolean => !!(item as any).is_nft || !!item.preview || !!item.nft_data;

const getItemImage = (item: OfferItem): string | null =>
  item.preview?.tiny || item.preview?.medium || item.nft_data?.data_uris?.[0] || null;

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatRelativeTime = (dateString: string | undefined): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
};

// Detect if offer is a Sell (offering NFT) or Bid (requesting NFT)
type OfferType = 'sell' | 'bid';

interface OfferWithType extends Offer {
  offerType: OfferType;
  nftItem: OfferItem | null;
  priceItem: OfferItem | null;
}

const categorizeOffer = (offer: Offer): OfferWithType => {
  const offeredNft = offer.offered?.find(item => isNft(item) && item.collection?.id === COLLECTION_ID);
  const requestedNft = offer.requested?.find(item => isNft(item) && item.collection?.id === COLLECTION_ID);
  
  if (offeredNft) {
    // Sell offer: NFT is being offered
    const priceItem = offer.requested?.find(item => !isNft(item)) || null;
    return { ...offer, offerType: 'sell', nftItem: offeredNft, priceItem };
  } else if (requestedNft) {
    // Bid offer: NFT is being requested
    const priceItem = offer.offered?.find(item => !isNft(item)) || null;
    return { ...offer, offerType: 'bid', nftItem: requestedNft, priceItem };
  }
  
  // Fallback
  return { ...offer, offerType: 'sell', nftItem: offer.offered?.[0] || null, priceItem: offer.requested?.[0] || null };
};

// Group offers by NFT ID
interface GroupedOffer {
  nftId: string;
  nftItem: OfferItem;
  sells: OfferWithType[];
  bids: OfferWithType[];
  totalCount: number;
}

const groupOffersByNft = (offers: Offer[]): GroupedOffer[] => {
  const categorized = offers.map(categorizeOffer);
  const groups = new Map<string, GroupedOffer>();
  
  for (const offer of categorized) {
    if (!offer.nftItem) continue;
    const nftId = offer.nftItem.id;
    
    if (!groups.has(nftId)) {
      groups.set(nftId, {
        nftId,
        nftItem: offer.nftItem,
        sells: [],
        bids: [],
        totalCount: 0,
      });
    }
    
    const group = groups.get(nftId)!;
    if (offer.offerType === 'sell') {
      group.sells.push(offer);
    } else {
      group.bids.push(offer);
    }
    group.totalCount++;
  }
  
  // Sort sells by price ascending, bids by price descending
  for (const group of groups.values()) {
    group.sells.sort((a, b) => (a.priceItem?.amount || 0) - (b.priceItem?.amount || 0));
    group.bids.sort((a, b) => (b.priceItem?.amount || 0) - (a.priceItem?.amount || 0));
  }
  
  return Array.from(groups.values());
};

type SortOption = 'price-high' | 'price-low' | 'date-newest' | 'date-oldest';

export default function MarketplacePage() {
  const router = useRouter();
  const { setShowModal } = useWalletConnect();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [expandedSort, setExpandedSort] = useState(false);
  const [expandedStatus, setExpandedStatus] = useState(false);
  const [statusFilter, setStatusFilter] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('statusFilter');
      return saved ? parseInt(saved) : 0;
    }
    return 0;
  });
  const [sortOption, setSortOption] = useState<SortOption>('date-newest');

  useEffect(() => { 
    localStorage.setItem('statusFilter', statusFilter.toString()); 
    localStorage.setItem('sortOption', sortOption);
  }, [statusFilter, sortOption]);
  useEffect(() => { fetchOffers(statusFilter); }, [statusFilter]);

  const [knownOfferIds, setKnownOfferIds] = useState<Set<string>>(new Set());
  const knownOfferIdsRef = useRef<Set<string>>(new Set());
  const PAGE_SIZE = 100;

  const fetchOffers = async (status: number) => {
    setLoading(true);
    try {
      // Always use offered_or_requested to include both sells (NFT offered) and bids (NFT requested)
      const queryParam = 'offered_or_requested';
      let allOffers: Offer[] = [];
      let page = 1;
      let totalPages = 1;
      while (page <= totalPages) {
        const url = `https://api.dexie.space/v1/offers?${queryParam}=${COLLECTION_ID}&status=${status}&page=${page}&page_size=${PAGE_SIZE}`;
        const res = await fetch(url);
        if (!res.ok) break;
        const data: ApiResponse = await res.json();
        totalPages = Math.ceil(data.count / data.page_size);
        allOffers = [...allOffers, ...(data.offers || [])];
        page++;
      }
      setOffers(allOffers);
      const idSet = new Set(allOffers.map(o => o.id));
      setKnownOfferIds(idSet);
      knownOfferIdsRef.current = idSet;
    } catch (e) {
      console.error('Error fetching offers:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ws = new WebSocket('wss://api.dexie.space/v1/stream');
    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type === 'offer' && parsed.data) {
          const incoming: Offer = parsed.data;
          const allItems = [...(incoming.offered || []), ...(incoming.requested || [])];
          const hasCollectionInItem = allItems.some(item => item.collection?.id === COLLECTION_ID);
          const isKnownOffer = knownOfferIdsRef.current.has(incoming.id);
          if (!hasCollectionInItem && !isKnownOffer) return;
          if (!isKnownOffer && hasCollectionInItem) {
            knownOfferIdsRef.current.add(incoming.id);
            setKnownOfferIds(prev => new Set([...prev, incoming.id]));
          }
          setOffers((prev) => {
            if (incoming.status !== statusFilter) return prev.filter((o) => o.id !== incoming.id);
            const exists = prev.find((o) => o.id === incoming.id);
            if (exists) return prev.map((o) => (o.id === incoming.id ? incoming : o));
            return [incoming, ...prev];
          });
        }
      } catch {}
    };
    return () => ws.close();
  }, [statusFilter]);

  const filteredOffers = useMemo(() => {
    if (!search.trim()) return offers;
    const searchLower = search.toLowerCase();
    return offers.filter(offer => {
      const allItems = [...(offer.offered || []), ...(offer.requested || [])];
      return allItems.some(item => item.name?.toLowerCase().includes(searchLower));
    });
  }, [offers, search]);

  // Group offers by NFT and apply sorting
  const groupedOffers = useMemo(() => {
    const grouped = groupOffersByNft(filteredOffers);
    
    // Sort grouped offers based on selected option
    return grouped.sort((a, b) => {
      const aOffer = a.sells[0] || a.bids[0];
      const bOffer = b.sells[0] || b.bids[0];
      
      const aPrice = aOffer.priceItem?.amount || 0;
      const bPrice = bOffer.priceItem?.amount || 0;
      
      const aDate = new Date(aOffer.date_found).getTime();
      const bDate = new Date(bOffer.date_found).getTime();
      
      switch (sortOption) {
        case 'price-high':
          return bPrice - aPrice;
        case 'price-low':
          return aPrice - bPrice;
        case 'date-newest':
          return bDate - aDate;
        case 'date-oldest':
          return aDate - bDate;
        default:
          return 0;
      }
    });
  }, [filteredOffers, sortOption]);
  
  // Track expanded cards
  const [expandedNftId, setExpandedNftId] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="heading-5xl text-foreground mb-2">Frog Offers</h1>
            <p className="text-muted-foreground text-base max-w-2xl">
              Browse and discover unique frog on Chia. Find your perfect amphibian companion and add it to your collection.
            </p>
          </div>

          <div className="mt-6 relative w-full">
            <div className="flex w-full border border-border rounded-lg overflow-hidden bg-background">
              {loading ? (
                <div className="flex-1 min-w-0 px-4 py-2">
                  <div className="h-5 w-full max-w-[200px] bg-muted rounded animate-pulse" />
                </div>
              ) : (
                <input
                  type="text"
                  placeholder={`Search among ${filteredOffers.length} offers...`}
                  className="flex-1 min-w-0 px-4 py-2 text-sm outline-none bg-background text-foreground placeholder:text-muted-foreground"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              )}
              <div className="flex shrink-0">
                <button
                  className="px-2.5 py-2 bg-muted hover:bg-muted/80 text-muted-foreground flex items-center border-l border-border"
                  onClick={() => fetchOffers(statusFilter)}
                  disabled={loading}
                  title="Refresh"
                >
                  <FiRefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
                <button
                  className="px-2.5 py-2 bg-muted hover:bg-muted/80 text-muted-foreground flex items-center border-l border-border"
                  onClick={() => setShowFilter(!showFilter)}
                  title="Filter"
                >
                  <FiFilter size={18} />
                </button>
                <button
                  className="px-2.5 py-2 flex items-center gap-1.5 transition-colors border-l border-border bg-muted hover:bg-muted/80 text-muted-foreground"
                  onClick={() => setShowModal(true)}
                  title="Wallet"
                >
                  <LuWallet size={18} />
                </button>
              </div>
            </div>

            {showFilter && (
              <div className="absolute inset-x-0 w-full bg-background border border-border rounded-lg z-20 mt-2 shadow-lg">
                {/* Sort By Section */}
                <div className="border-b border-border">
                  <button
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted"
                    onClick={() => setExpandedSort(!expandedSort)}
                  >
                    <span className="font-semibold text-foreground">Sort By</span>
                    <FiChevronDown className={`text-muted-foreground transition-transform ${expandedSort ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedSort && (
                    <div className="px-4 py-3 border-t border-border">
                      <div className="flex flex-col gap-1">
                        {[
                          { value: 'price-high', label: 'Price High' },
                          { value: 'price-low', label: 'Price Low' },
                          { value: 'date-newest', label: 'Newest' },
                          { value: 'date-oldest', label: 'Oldest' },
                        ].map(({ value, label }) => (
                          <button
                            key={value}
                            className={`block w-full text-left py-1 px-2 hover:bg-muted rounded text-foreground ${sortOption === value ? 'bg-muted' : ''}`}
                            onClick={() => setSortOption(value as SortOption)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Status Section */}
                <div>
                  <button
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted"
                    onClick={() => setExpandedStatus(!expandedStatus)}
                  >
                    <span className="font-semibold text-foreground">Status</span>
                    <FiChevronDown className={`text-muted-foreground transition-transform ${expandedStatus ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedStatus && (
                    <div className="px-4 py-3 border-t border-border">
                      <div className="flex flex-col gap-1">
                        {FILTER_OPTIONS.map(({ status, label }) => (
                          <button
                            key={status}
                            className={`block w-full text-left py-1 px-2 hover:bg-muted rounded text-foreground ${statusFilter === status ? 'bg-muted' : ''}`}
                            onClick={() => { setStatusFilter(status); }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>



          <div className="mt-4">
            {loading ? (
              <MarketplaceSkeleton />
            ) : groupedOffers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[60vh] w-full">
                <div className="text-muted-foreground text-lg">No offers found</div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {groupedOffers.map((group) => {
                  const isExpanded = expandedNftId === group.nftId;
                  const hasBids = group.bids.length > 0;
                  const primaryOffer = group.sells[0] || group.bids[0];
                  const allOffers = [...group.sells, ...group.bids];
                  
                  // Check if this group has multiple offers (needs expand arrow)
                  const hasMultipleOffers = group.totalCount > 1;
                  // Get other offers (excluding the primary one)
                  const otherOffers = allOffers.filter(o => o.id !== primaryOffer.id);
                  
                  return (
                    <div key={group.nftId}>
                      {/* Main card with optional expand section */}
                      <div
                        className={`bg-card border border-border rounded-lg overflow-hidden ${
                          primaryOffer.status === 1 || primaryOffer.status === 2 ? 'animate-pulse' : ''
                        }`}
                      >
                        {/* Primary offer - clickable to detail page */}
                        <div
                          className="p-4 hover:bg-muted/30 transition-all cursor-pointer"
                          onClick={() => router.push(`/marketplace/offer/${primaryOffer.id}`)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(primaryOffer.date_completed || primaryOffer.date_pending || primaryOffer.date_found)}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                primaryOffer.offerType === 'sell' 
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' 
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                              }`}>
                                {primaryOffer.offerType === 'sell' ? 'Ask' : 'Bid'}
                              </span>
                              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_MAP[primaryOffer.status]?.color || 'bg-muted text-muted-foreground'}`}>
                                {STATUS_MAP[primaryOffer.status]?.label || 'Unknown'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Offered</div>
                            </div>
                            <div className="w-5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide text-right">Requested</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col gap-2">
                                {(primaryOffer.offered || []).map((item) => (
                                  <div key={item.id} className="flex items-center gap-2">
                                    {isNft(item) ? (
                                      <>
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 relative rounded-lg overflow-hidden bg-muted shrink-0">
                                          <img
                                            src={getItemImage(item) || '/placeholder.png'}
                                            alt={item.name || 'NFT'}
                                            className="absolute inset-0 w-full h-full object-cover"
                                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.png'; }}
                                          />
                                        </div>
                                        <span className="text-sm lg:text-base text-foreground truncate">{item.name || 'NFT'}</span>
                                      </>
                                    ) : (
                                      <span className="text-sm text-foreground font-medium">{formatAmount(item)}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="shrink-0"><FiArrowRight className="text-muted-foreground" size={20} /></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col gap-2">
                                {(primaryOffer.requested || []).map((item) => (
                                  <div key={item.id} className="flex items-center gap-2 justify-end text-right">
                                    {isNft(item) ? (
                                      <>
                                        <span className="text-sm lg:text-base text-foreground truncate">{item.name || 'NFT'}</span>
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 relative rounded-lg overflow-hidden bg-muted shrink-0">
                                          <img
                                            src={getItemImage(item) || '/placeholder.png'}
                                            alt={item.name || 'NFT'}
                                            className="absolute inset-0 w-full h-full object-cover"
                                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.png'; }}
                                          />
                                        </div>
                                      </>
                                    ) : (
                                      <span className="text-sm text-foreground font-medium">{formatAmount(item)}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Expanded list of other offers */}
                        {isExpanded && otherOffers.length > 0 && (
                          <div className="border-t border-border bg-muted/20">
                            {otherOffers.map((offer) => (
                              <div
                                key={offer.id}
                                className="px-4 py-2.5 flex items-center justify-between hover:bg-muted/50 cursor-pointer border-b border-border last:border-b-0"
                                onClick={() => router.push(`/marketplace/offer/${offer.id}`)}
                              >
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                    offer.offerType === 'sell' 
                                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' 
                                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                                  }`}>
                                    {offer.offerType === 'sell' ? 'Sell' : 'Bid'}
                                  </span>
                                  <span className="text-sm font-medium text-foreground">
                                    {offer.priceItem ? formatAmount(offer.priceItem) : 'NFTs'}
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {formatRelativeTime(offer.date_found)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Expand/collapse arrow - only show if there are bids */}
                        {hasBids && (
                          <button
                            className="w-full flex justify-center items-center py-1 border-t border-border hover:bg-muted/50 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedNftId(isExpanded ? null : group.nftId);
                            }}
                          >
                            <div className="flex flex-col items-center">
                              <div className="w-12 h-0.5 bg-border rounded-full" />
                              <svg 
                                className={`w-4 h-4 text-muted-foreground ${isExpanded ? 'rotate-180' : ''} ${!isExpanded ? 'animate-pulse' : ''}`}
                                viewBox="0 0 20 20" 
                                fill="currentColor"
                              >
                                <polygon points="10,14 4,8 16,8" />
                              </svg>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
