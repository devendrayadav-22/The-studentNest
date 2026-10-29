import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Utensils, Clock, ChevronLeft, ChevronRight, LayoutGrid, Map as MapIcon, Info } from 'lucide-react';
import MessCard from '../../components/MessCard';
import MapView from '../../components/MapView';
import Skeleton, { CardSkeleton } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import Button from '../../components/Button';
import { messApi } from '../../api/messApi';
import { FOOD_TYPE_OPTIONS, MESS_STATUS_OPTIONS, MESS_SORT_OPTIONS } from '../../constants/enums';

export const MessList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [messes, setMesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'

  const [pageMeta, setPageMeta] = useState({
    page: 0,
    size: 9,
    totalElements: 0,
    totalPages: 1
  });

  const filters = useMemo(() => {
    let statusParam = searchParams.get('status') || '';
    if (!statusParam && searchParams.get('openNow') === 'true') {
      statusParam = 'open';
    }

    return {
      q: searchParams.get('q') || '',
      foodType: searchParams.get('foodType') || '',
      status: statusParam || 'all',
      maxDistanceKm: searchParams.get('maxDistanceKm') || '',
      sortBy: searchParams.get('sortBy') || 'latest',
      order: searchParams.get('order') || 'desc',
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 0,
    };
  }, [searchParams]);

  const updateFilters = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === '' || value === null || value === undefined) {
      newParams.delete(key);
    } else {
      newParams.set(key, String(value));
    }
    if (key !== 'page') newParams.set('page', '0');
    setSearchParams(newParams);
  };

  const handleStatusChange = (statusValue) => {
    const newParams = new URLSearchParams(searchParams);
    if (!statusValue || statusValue === 'all') {
      newParams.delete('status');
      newParams.delete('openNow');
    } else {
      newParams.set('status', statusValue);
      if (statusValue === 'open') {
        newParams.set('openNow', 'true');
      } else {
        newParams.delete('openNow');
      }
    }
    newParams.set('page', '0');
    setSearchParams(newParams);
  };

  const currentSortValue = useMemo(() => {
    const found = MESS_SORT_OPTIONS.find(
      (opt) => opt.sortBy === filters.sortBy && opt.order === filters.order
    );
    return found ? found.value : MESS_SORT_OPTIONS[0].value;
  }, [filters.sortBy, filters.order]);

  const handleSortChange = (sortOptionValue) => {
    const selected = MESS_SORT_OPTIONS.find((opt) => opt.value === sortOptionValue) || MESS_SORT_OPTIONS[0];
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortBy', selected.sortBy);
    newParams.set('order', selected.order);
    newParams.set('page', '0');
    setSearchParams(newParams);
  };

  const resetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const fetchMesses = useCallback(async () => {
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
      if (filters.foodType) params.foodType = filters.foodType;
      if (filters.status && filters.status !== 'all') {
        params.status = filters.status;
        if (filters.status === 'open') {
          params.openNow = true;
        }
      }
      if (filters.maxDistanceKm) params.maxDistanceKm = Number(filters.maxDistanceKm);

      const res = await messApi.getAll(params);
      setMesses(res.content || []);
      setPageMeta({
        page: res.page ?? 0,
        size: res.size ?? 9,
        totalElements: res.totalElements ?? 0,
        totalPages: res.totalPages ?? 1
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load mess services');
    } finally {
      setLoading(false);
    }
  }, [
    filters.q,
    filters.foodType,
    filters.status,
    filters.maxDistanceKm,
    filters.sortBy,
    filters.order,
    filters.page,
    pageMeta.size
  ]);

  useEffect(() => {
    fetchMesses();
  }, [fetchMesses]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Mess & Tiffin Services Near IPS Academy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Discover hygienic North Indian & MP-style student dining centers and door delivery tiffins
          </p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.q}
            onChange={(e) => updateFilters('q', e.target.value)}
            placeholder="Search mess by name or area..."
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-white/90 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white/70 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-slate-300/60 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Food Type filter pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600 mr-1">Food:</span>
            {FOOD_TYPE_OPTIONS.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => updateFilters('foodType', type.value)}
                className={`py-1.5 px-3 text-xs font-semibold rounded-xl border transition-all ${
                  filters.foodType === type.value
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Status filter: All / Open / Closed */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <span className="text-xs font-bold text-slate-600 mr-1">Status:</span>
            {MESS_STATUS_OPTIONS.map((st) => (
              <button
                key={st.value}
                type="button"
                onClick={() => handleStatusChange(st.value)}
                className={`py-1.5 px-3 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-all ${
                  filters.status === st.value
                    ? st.value === 'open'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : st.value === 'closed'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-slate-800 text-white border-slate-800 shadow-xs'
                    : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{st.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* View Mode & Sort selector */}
        <div className="flex items-center gap-3">
          {/* View mode: Grid vs Map */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-amber-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'map'
                  ? 'bg-white text-amber-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              aria-label="Map view"
            >
              <MapIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-600">Sort:</span>
            <select
              value={currentSortValue}
              onChange={(e) => handleSortChange(e.target.value)}
              className="text-xs font-semibold bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              {MESS_SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Food Type Hint if Pure Veg or Non-Veg selected */}
      {(filters.foodType === 'VEG' || filters.foodType === 'NONVEG') && (
        <div className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Note: Showing {filters.foodType === 'VEG' ? 'Pure Veg' : 'Non-Veg'} options (includes messes serving both).</span>
        </div>
      )}

      {/* Main Content Area */}
      {error ? (
        <ErrorState message={error} onRetry={fetchMesses} />
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : messes.length === 0 ? (
        <EmptyState
          title="No Mess Services Found"
          description="Try changing the food type filter, status filter, or clearing search keywords."
          actionLabel="Clear Filters"
          onAction={resetFilters}
        />
      ) : viewMode === 'map' ? (
        <div className="space-y-4">
          <div className="bg-white/80 rounded-2xl p-2 border border-slate-200 shadow-sm overflow-hidden">
            <MapView targets={messes} targetType="MESS" height="520px" />
          </div>
          <p className="text-xs text-slate-500 text-center">
            Displaying {messes.length} mess locations around IPS Academy, Indore.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {messes.map((mess) => (
            <MessCard key={mess.id} mess={mess} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && pageMeta.totalPages > 1 && viewMode !== 'map' && (
        <div className="flex items-center justify-between bg-white/70 backdrop-blur-md p-3.5 rounded-2xl border border-slate-300/60 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">
            Page {pageMeta.page + 1} of {pageMeta.totalPages} ({pageMeta.totalElements} messes)
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
  );
};

export default MessList;
