'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { FrogCard } from './FrogCard';
import { FrogGridSkeleton } from './SkeletonLoader';
import { FiFilter, FiRefreshCw, FiChevronDown } from 'react-icons/fi';
import { populateFrogCache } from '@/hooks/use-frog-cache';

interface SimpleFrog {
  name: string;
  image: string;
}

interface FrogMetadataItem {
  name: string;
  image: string;
  description?: string;
  created_at?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
}

interface FrogWithMeta extends SimpleFrog {
  background?: string;
  color?: string;
  scienceName?: string;
  origin?: string;
  toxicity?: string;
  conservationStatus?: string;
  rarityTier?: string;
}

interface FrogControlsProps {
  initialFrogs: SimpleFrog[];
  total: number;
  initialMetadata?: FrogMetadataItem[] | null;
}

type FilterSection = 'name' | 'scienceName' | 'background' | 'color' | 'origin' | 'toxicity' | 'conservationStatus' | 'rarityTier';

export default function FrogControls({ initialFrogs, total, initialMetadata = null }: FrogControlsProps) {
  const [frogs, setFrogs] = useState<SimpleFrog[]>(initialFrogs);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialMetadata && initialMetadata.length > 0) {
      populateFrogCache(initialMetadata);
    }
  }, [initialMetadata]);

  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const [filterName, setFilterName] = useState<string | null>(null);
  const [filterScienceName, setFilterScienceName] = useState<string | null>(null);
  const [filterBackground, setFilterBackground] = useState<string | null>(null);
  const [filterColor, setFilterColor] = useState<string | null>(null);
  const [filterOrigin, setFilterOrigin] = useState<string | null>(null);
  const [filterToxicity, setFilterToxicity] = useState<string | null>(null);
  const [filterConservationStatus, setFilterConservationStatus] = useState<string | null>(null);
  const [filterRarity, setFilterRarity] = useState<string | null>(null);

  const [metadata, setMetadata] = useState<FrogMetadataItem[] | null>(initialMetadata);
  const [metadataLoading, setMetadataLoading] = useState(false);

  const [openSections, setOpenSections] = useState<Record<FilterSection, boolean>>({
    name: false, scienceName: false, background: false, color: false,
    origin: false, toxicity: false, conservationStatus: false, rarityTier: false,
  });

  const toggleSection = (section: FilterSection) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const loadMetadata = useCallback(async () => {
    if (metadata !== null || metadataLoading) return;
    setMetadataLoading(true);
    try {
      const res = await fetch('/api/metadata', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setMetadata(data.metadata || []);
      }
    } catch (e) {
      console.error('Error loading metadata:', e);
    } finally {
      setMetadataLoading(false);
    }
  }, [metadata, metadataLoading]);

  const handleFilterClick = () => {
    const newShowFilter = !showFilter;
    setShowFilter(newShowFilter);
    if (newShowFilter && metadata === null) loadMetadata();
  };

  const fetchFreshFrogs = async () => {
    try {
      setLoading(true);
      setMetadataLoading(true);
      
      // Clear cache via refresh endpoint
      await fetch('/api/refresh', { method: 'POST' });
      
      // Load images immediately (fast)
      const res = await fetch('/api/images', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const normalized = (data.images || []).map((img: { url: string; filename: string }) => {
          const name = (img.filename || 'unknown')
            .replace(/\.(png|jpg|jpeg|gif|webp)$/i, '')
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, (c: string) => c.toUpperCase());
          return { name, image: img.url };
        });
        setFrogs(normalized);
        setLoading(false); // Image grid appears immediately, stop showing skeleton
      }
      
      // Load metadata in background (slower)
      const metaRes = await fetch('/api/metadata', { cache: 'no-store' });
      if (metaRes.ok) {
        const metaData = await metaRes.json();
        const newMetadata = metaData.metadata || [];
        setMetadata(newMetadata);
        populateFrogCache(newMetadata);
      }
    } catch (e) {
      console.error('Error refreshing frogs:', e);
    } finally {
      setMetadataLoading(false); // Filter skeleton disappears once metadata is loaded
    }
  };

  const frogsWithMeta: FrogWithMeta[] = useMemo(() => {
    if (!metadata) return frogs;
    return frogs.map(frog => {
      const meta = metadata.find(m => m.name?.toLowerCase() === frog.name.toLowerCase());
      if (!meta?.attributes) return frog;
      const attr = Object.fromEntries(meta.attributes.map(a => [a.trait_type, a.value]));
      return {
        ...frog,
        background: attr['Background'] || '',
        color: attr['Color'] || '',
        scienceName: attr['Science Name'] || '',
        origin: attr['Origin'] || '',
        toxicity: attr['Toxicity'] || '',
        conservationStatus: attr['Conservation Status'] || '',
        rarityTier: attr['Rarity Tier'] || '',
      };
    });
  }, [frogs, metadata]);

  const filteredFrogs = useMemo(() => {
    let result = frogsWithMeta;
    if (search.trim()) result = result.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
    if (metadata && filterName) result = result.filter(f => f.name.toLowerCase() === filterName.toLowerCase());
    if (metadata && filterScienceName) result = result.filter(f => f.scienceName?.toLowerCase() === filterScienceName.toLowerCase());
    if (metadata && filterBackground) result = result.filter(f => f.background?.toLowerCase() === filterBackground.toLowerCase());
    if (metadata && filterColor) result = result.filter(f => f.color?.toLowerCase() === filterColor.toLowerCase());
    if (metadata && filterOrigin) result = result.filter(f => f.origin?.toLowerCase() === filterOrigin.toLowerCase());
    if (metadata && filterToxicity) result = result.filter(f => f.toxicity?.toLowerCase() === filterToxicity.toLowerCase());
    if (metadata && filterConservationStatus) result = result.filter(f => f.conservationStatus?.toLowerCase() === filterConservationStatus.toLowerCase());
    if (metadata && filterRarity) result = result.filter(f => f.rarityTier?.toLowerCase() === filterRarity.toLowerCase());
    return result;
  }, [frogsWithMeta, search, filterName, filterScienceName, filterBackground, filterColor, filterOrigin, filterToxicity, filterConservationStatus, filterRarity, metadata]);

  const getUniqueValues = useCallback((traitType: string) => {
    if (!metadata) return [];
    const values = metadata
      .map(m => { const attr = m.attributes?.find(a => a.trait_type === traitType); return attr?.value || ''; })
      .filter(v => v.trim() !== '');
    return [...new Set(values)].sort();
  }, [metadata]);

  const uniqueNames = useMemo(() => {
    if (!metadata) return [];
    return [...new Set(metadata.map(m => m.name || '').filter(n => n.trim() !== ''))].sort();
  }, [metadata]);

  const uniqueScienceNames = useMemo(() => getUniqueValues('Science Name'), [getUniqueValues]);
  const uniqueBackgrounds = useMemo(() => getUniqueValues('Background'), [getUniqueValues]);
  const uniqueColors = useMemo(() => getUniqueValues('Color'), [getUniqueValues]);
  const uniqueOrigins = useMemo(() => getUniqueValues('Origin'), [getUniqueValues]);
  const uniqueToxicities = useMemo(() => getUniqueValues('Toxicity'), [getUniqueValues]);
  const uniqueConservationStatuses = useMemo(() => getUniqueValues('Conservation Status'), [getUniqueValues]);
  const uniqueRarityTiers = useMemo(() => getUniqueValues('Rarity Tier'), [getUniqueValues]);

  const isFilteringByMeta = filterName || filterScienceName || filterBackground || filterColor || filterOrigin || filterToxicity || filterConservationStatus || filterRarity;
  const showGridLoading = loading || (isFilteringByMeta && metadataLoading);

  const renderFilterSection = (
    section: FilterSection,
    label: string,
    values: string[],
    currentFilter: string | null,
    toggleFilter: (value: string) => void,
    isLast: boolean = false
  ) => (
    <div className={isLast ? '' : 'border-b border-border'}>
      <button
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted"
        onClick={() => toggleSection(section)}
      >
        <span className="font-semibold text-foreground">{label}</span>
        <FiChevronDown className={`text-muted-foreground transition-transform ${openSections[section] ? 'rotate-180' : ''}`} />
      </button>
      {openSections[section] && (
        <div className="px-4 pb-3">
          {metadataLoading ? (
            <div className="space-y-1">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-7 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : values.length === 0 ? (
            <div className="text-center text-muted-foreground py-2">Empty</div>
          ) : (
            <div className="max-h-32 overflow-y-auto">
              {values.map(v => (
                <button
                  key={v}
                  className={`block w-full text-left py-1 px-2 hover:bg-muted rounded text-foreground ${currentFilter?.toLowerCase() === v.toLowerCase() ? 'bg-muted' : ''}`}
                  onClick={() => toggleFilter(v)}
                >
                  {v}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="mt-6 relative w-full">
      <div className="flex w-full border border-border rounded-lg overflow-hidden bg-background">
        <input
          type="text"
          placeholder="Search frogs..."
          className="flex-1 px-4 py-2 text-sm outline-none bg-background text-foreground placeholder:text-muted-foreground"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button
          className="px-3 py-2 bg-muted hover:bg-muted/80 text-muted-foreground flex items-center"
          onClick={handleFilterClick}
        >
          <FiFilter size={18} />
        </button>
        <button
          className="px-3 py-2 bg-muted hover:bg-muted/80 text-muted-foreground flex items-center"
          onClick={fetchFreshFrogs}
          disabled={loading}
        >
          <FiRefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {showFilter && (
        <div className="absolute left-0 right-0 w-full bg-background border border-border rounded-lg z-20 mt-2 shadow-lg">
          {renderFilterSection('name', 'Name', uniqueNames, filterName, (v) => setFilterName(prev => prev?.toLowerCase() === v.toLowerCase() ? null : v))}
          {renderFilterSection('scienceName', 'Science Name', uniqueScienceNames, filterScienceName, (v) => setFilterScienceName(prev => prev?.toLowerCase() === v.toLowerCase() ? null : v))}
          {renderFilterSection('background', 'Background', uniqueBackgrounds, filterBackground, (v) => setFilterBackground(prev => prev?.toLowerCase() === v.toLowerCase() ? null : v))}
          {renderFilterSection('color', 'Color', uniqueColors, filterColor, (v) => setFilterColor(prev => prev?.toLowerCase() === v.toLowerCase() ? null : v))}
          {renderFilterSection('origin', 'Origin', uniqueOrigins, filterOrigin, (v) => setFilterOrigin(prev => prev?.toLowerCase() === v.toLowerCase() ? null : v))}
          {renderFilterSection('toxicity', 'Toxicity', uniqueToxicities, filterToxicity, (v) => setFilterToxicity(prev => prev?.toLowerCase() === v.toLowerCase() ? null : v))}
          {renderFilterSection('conservationStatus', 'Conservation Status', uniqueConservationStatuses, filterConservationStatus, (v) => setFilterConservationStatus(prev => prev?.toLowerCase() === v.toLowerCase() ? null : v))}
          {renderFilterSection('rarityTier', 'Rarity Tier', uniqueRarityTiers, filterRarity, (v) => setFilterRarity(prev => prev?.toLowerCase() === v.toLowerCase() ? null : v), true)}
        </div>
      )}

      <div className="mt-4">
        {showGridLoading ? (
          total > 0 ? <FrogGridSkeleton count={total} /> : null
        ) : filteredFrogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] w-full">
            <div className="text-muted-foreground text-lg">No frogs found</div>
          </div>
        ) : (
          <div className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10 gap-4">
            {filteredFrogs.map((frog, idx) => (
              <FrogCard key={frog.name || idx} frog={frog} priority={idx < 10} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
