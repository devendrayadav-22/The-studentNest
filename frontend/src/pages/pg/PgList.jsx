import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, Map, Filter, ChevronLeft, ChevronRight, SlidersHorizontal, Search } from 'lucide-react';
import PgCard from '../../components/PgCard';
import FilterSidebar from '../../components/FilterSidebar';
import MapView from '../../components/MapView';
import Skeleton, { CardSkeleton } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import Button from '../../components/Button';
import { pgApi } from '../../api/pgApi';
import { wishlistApi } from '../../api/wishlistApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PG_SORT_OPTIONS } from '../../constants/enums';

export const PgList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, role } = useAuth();
  const { success, error: toastError } = useToast();

  const [pgs, setPgs] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [pageMeta, setPageMeta] = useState({
    page: 0,
    size: 9,
    totalElements: 0,
    totalPages: 1
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'map'
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Extract filter parameters from URL
  const filters = {
    q: searchParams.get('q') || '',
    type: searchParams.get('type') || '',
    gender: searchParams.get('gender') || '',
    sharing: searchParams.get('sharing') || '',
    maxRent: searchParams.get('maxRent') || '',
    minRent: searchParams.get('minRent') || '',
    facilities: searchParams.get('facilities') || '',
    verifiedOnly: searchParams.get('verifiedOnly') || '',
    maxDistanceKm: searchParams.get('maxDistanceKm') || '',
    sortBy: searchParams.get('sortBy') || 'latest',
    order: searchParams.get('order') || 'desc',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 0,
  };

  const updateFilters = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === '' || value === null || value === undefined) {
      newParams.delete(key);
    } else {
      newParams.set(key, String(value));
    }
    // Reset page to 0 on filter change
    if (key !== 'page') {
      newParams.set('page', '0');
    }
    setSearchParams(newParams);
  };

  const resetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const currentSortValue = useMemo(() => {
    const found = PG_SORT_OPTIONS.find(
      (opt) => opt.sortBy === filters.sortBy && opt.order === filters.order
    );
    return found ? found.value : PG_SORT_OPTIONS[0].value;
  }, [filters.sortBy, filters.order]);

  const handleSortChange = (sortOptionValue) => {
    const selected = PG_SORT_OPTIONS.find((opt) => opt.value === sortOptionValue) || PG_SORT_OPTIONS[0];
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortBy', selected.sortBy);
    newParams.set('order', selected.order);
    newParams.set('page', '0');
    setSearchParams(newParams);
  };

  // Load wishlist IDs for current student
  const loadWishlist = useCallback(async () => {
    if (isAuthenticated && role === 'STUDENT') {
      try {
        const list = await wishlistApi.getWishlist();
        const pgIds = new Set(
          list.filter((w) => w.targetType === 'PG').map((w) => w.targetId)
        );
        setWishlistIds(pgIds);
      } catch (err) {
        // silently ignore wishlist pre-fetch errors
      }
    }
  }, [isAuthenticated, role]);

  const fetchPgs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        size: pageMeta.size,
        page: filters.page,
        sortBy: filters.sortBy,
        order: filters.order
      };

      if (filters.q) params.q = filters.q;
      if (filters.type) params.type = filters.type;
      if (filters.gender) params.gender = filters.gender;
      if (filters.sharing) params.sharing = filters.sharing;
      if (filters.maxRent) params.maxRent = Number(filters.maxRent);
      if (filters.minRent) params.minRent = Number(filters.minRent);
      if (filters.facilities) params.facilities = filters.facilities;
      if (filters.verifiedOnly === 'true' || filters.verifiedOnly === true) params.verifiedOnly = true;
      if (filters.maxDistanceKm) params.maxDistanceKm = Number(filters.maxDistanceKm);

      const res = await pgApi.getAll(params);
      setPgs(res.content || []);
      setPageMeta({
        page: res.page ?? 0,
        size: res.size ?? 9,
        totalElements: res.totalElements ?? 0,
        totalPages: res.totalPages ?? 1
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch PG listings');
    } finally {
      setLoading(false);
    }
  }, [
    filters.q,
    filters.type,
    filters.gender,
    filters.sharing,
    filters.maxRent,
    filters.minRent,
    filters.facilities,
    filters.verifiedOnly,
    filters.maxDistanceKm,
    filters.sortBy,
    filters.order,
    filters.page,
    pageMeta.size
  ]);

  useEffect(() => {
    fetchPgs();
  }, [fetchPgs]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // Handle wishlist toggle
  const handleToggleWishlist = async (pg) => {
    if (!isAuthenticated) return;
    const isSaved = wishlistIds.has(pg.id);

    try {
      if (isSaved) {
        // Need to find wishlist id
        const list = await wishlistApi.getWishlist();
        const found = list.find((item) => item.targetType === 'PG' && item.targetId === pg.id);
        if (found) {
          await wishlistApi.removeFromWishlist(found.id);
          setWishlistIds((prev) => {
            const next = new Set(prev);
            next.delete(pg.id);
            return next;
          });
          success(`Removed "${pg.title}" from wishlist.`);
        }
      } else {
        await wishlistApi.addToWishlist('PG', pg.id);
        setWishlistIds((prev) => new Set(prev).add(pg.id));
        success(`Saved "${pg.title}" to wishlist!`);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Wishlist operation failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            PGs, Hostels & Flats Near IPS Academy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {pageMeta.totalElements} verified student accommodations within walking and commute distance
          </p>
        </div>

        {/* Search input in top header */}
        <div className="flex items-center gap-2 max-w-md w-full md:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.q}
              onChange={(e) => updateFilters('q', e.target.value)}
              placeholder="Search by area, PG name..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-white/90 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Mobile Filter Sheet Button */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-teal-700 text-white shadow-xs shrink-0"
            aria-label="Open filter menu"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Control Strip: Sort By & View Mode Toggles */}
      <div className="bg-white/70 backdrop-blur-md p-3 rounded-2xl border border-slate-300/60 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Sort Controls */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600">Sort By:</span>
          <select
            value={currentSortValue}
            onChange={(e) => handleSortChange(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
          >
            {PG_SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle: Grid / List / Map */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              viewMode === 'list'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-label="List view"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">List</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              viewMode === 'map'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-label="Map view"
          >
            <Map className="w-4 h-4" />
            <span className="hidden sm:inline">Map</span>
          </button>
        </div>
      </div>

      {/* Main Body: Filter Sidebar + Content */}
      <div className="flex gap-6 items-start">
        {/* Filter Sidebar Component */}
        <FilterSidebar
          filters={filters}
          onChange={updateFilters}
          onReset={resetFilters}
          isOpen={mobileFilterOpen}
          onClose={() => setMobileFilterOpen(false)}
        />

        {/* Content Listing Area */}
        <div className="flex-1 min-w-0 space-y-6">
          {error ? (
            <ErrorState message={error} onRetry={fetchPgs} />
          ) : loading ? (
            <div className={`grid ${viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'} gap-5`}>
              {Array.from({ length: 6 }).map((_, idx) => (
                <CardSkeleton key={idx} />
              ))}
            </div>
          ) : pgs.length === 0 ? (
            <EmptyState
              title="No Accommodations Match Your Filters"
              description="Try clearing some facilities, expanding your distance radius, or widening your rent budget."
              actionLabel="Clear All Filters"
              onAction={resetFilters}
            />
          ) : viewMode === 'map' ? (
            <div className="space-y-4">
              <MapView listings={pgs} height="520px" />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {pgs.map((pg) => (
                  <PgCard
                    key={pg.id}
                    pg={pg}
                    isWishlisted={wishlistIds.has(pg.id)}
                    onToggleWishlist={handleToggleWishlist}
                    viewMode="grid"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className={`grid ${viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'} gap-5`}>
              {pgs.map((pg) => (
                <PgCard
                  key={pg.id}
                  pg={pg}
                  isWishlisted={wishlistIds.has(pg.id)}
                  onToggleWishlist={handleToggleWishlist}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}

          {/* Server-Side Pagination Bar */}
          {!loading && pageMeta.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white/70 backdrop-blur-md p-3.5 rounded-2xl border border-slate-300/60 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">
                Page {pageMeta.page + 1} of {pageMeta.totalPages} ({pageMeta.totalElements} total stays)
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pageMeta.page <= 0}
                  onClick={() => updateFilters('page', pageMeta.page - 1)}
                  icon={ChevronLeft}
                >
                  Previous
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pageMeta.page >= pageMeta.totalPages - 1}
                  onClick={() => updateFilters('page', pageMeta.page + 1)}
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PgList;

