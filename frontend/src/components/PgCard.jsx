import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Users, Bed, Clock } from 'lucide-react';
import Card from './Card';
import Badge from './Badge';
import StarRating from './StarRating';
import ImageWithFallback from './ImageWithFallback';
import LoginPromptModal from './LoginPromptModal';
import { formatPrice, formatDistance, formatRelativeDays } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const PgCard = ({
  pg,
  isWishlisted = false,
  onToggleWishlist,
  viewMode = 'grid', // 'grid' | 'list'
  className = ''
}) => {
  const { isAuthenticated, role } = useAuth();
  const { error: toastError } = useToast();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }

    if (role !== 'STUDENT') {
      toastError('Only students can save listings to wishlist.');
      return;
    }

    if (onToggleWishlist) {
      onToggleWishlist(pg);
    }
  };

  const coverImage = pg.images && pg.images.length > 0 ? pg.images[0] : null;

  const contentNode = viewMode === 'list' ? (
    <Card hover className={`overflow-hidden flex flex-col md:flex-row group ${className}`}>
      {/* Cover image container */}
      <div className="relative md:w-72 h-52 md:h-auto shrink-0 overflow-hidden bg-slate-100">
        <Link to={`/pgs/${pg.id}`} className="block w-full h-full">
          <ImageWithFallback
            src={coverImage}
            alt={pg.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            fallbackType="pg"
          />
        </Link>

        {/* Badges on image */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {pg.verified && <Badge variant="verified" size="xs" />}
          {pg.stale && <Badge variant="stale" size="xs" />}
        </div>

        {/* Wishlist button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/80 backdrop-blur-md hover:bg-white text-slate-600 hover:text-red-500 transition-colors shadow-sm z-10"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-teal-700 uppercase tracking-wide">
              {pg.type} &bull; {pg.gender}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatRelativeDays(pg.lastUpdatedDaysAgo)}
            </span>
          </div>

          <Link to={`/pgs/${pg.id}`}>
            <h3 className="font-bold text-slate-900 text-lg hover:text-teal-700 transition-colors line-clamp-1">
              {pg.title}
            </h3>
          </Link>

          <p className="flex items-center gap-1.5 text-xs text-slate-600 mt-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{pg.address}</span>
            <span className="text-teal-700 font-semibold ml-1">
              ({formatDistance(pg.distanceKm)})
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              {pg.sharing} Sharing
            </span>
            {pg.availableBeds !== undefined && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 font-semibold border border-teal-200/60">
                <Bed className="w-3.5 h-3.5 text-teal-600" />
                {pg.availableBeds} beds left
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-200/70">
          <div>
            <span className="text-xs text-slate-500 block">Monthly Rent</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-900">{formatPrice(pg.rent)}</span>
              <span className="text-xs text-slate-500">/mo</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <StarRating rating={pg.averageRating} count={pg.reviewCount} showNumber size="xs" />
            <Link
              to={`/pgs/${pg.id}`}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-0.5"
            >
              View Details &rarr;
            </Link>
          </div>
        </div>
      </div>
    </Card>
  ) : (
    <Card hover className={`overflow-hidden flex flex-col group ${className}`}>
      {/* Cover Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <Link to={`/pgs/${pg.id}`} className="block w-full h-full">
          <ImageWithFallback
            src={coverImage}
            alt={pg.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            fallbackType="pg"
          />
        </Link>

        {/* Badges on image */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {pg.verified && <Badge variant="verified" size="xs" />}
          {pg.stale && <Badge variant="stale" size="xs" />}
        </div>

        {/* Wishlist button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/80 backdrop-blur-md hover:bg-white text-slate-600 hover:text-red-500 transition-colors shadow-sm z-10"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* Distance pill floating at bottom right of image */}
        <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1 shadow-sm">
          <MapPin className="w-3 h-3 text-teal-400" />
          {formatDistance(pg.distanceKm)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-teal-700 uppercase tracking-wide">
              {pg.type} &bull; {pg.gender}
            </span>
            <span className="text-[11px]">
              {formatRelativeDays(pg.lastUpdatedDaysAgo)}
            </span>
          </div>

          <Link to={`/pgs/${pg.id}`}>
            <h3 className="font-bold text-slate-900 text-base leading-snug hover:text-teal-700 transition-colors line-clamp-1">
              {pg.title}
            </h3>
          </Link>

          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            {pg.address}
          </p>

          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
              {pg.sharing} Sharing
            </span>
            {pg.availableBeds !== undefined && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-medium border border-teal-200/50">
                {pg.availableBeds} beds left
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3.5 mt-3 border-t border-slate-200/70">
          <div>
            <span className="text-[11px] text-slate-500 block">Rent</span>
            <div className="flex items-baseline">
              <span className="text-lg font-extrabold text-slate-900">{formatPrice(pg.rent)}</span>
              <span className="text-xs text-slate-500">/mo</span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <StarRating rating={pg.averageRating} count={pg.reviewCount} showNumber size="xs" />
            <Link
              to={`/pgs/${pg.id}`}
              className="mt-1 text-xs font-semibold text-teal-700 hover:text-teal-800"
            >
              Details &rarr;
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <>
      {contentNode}
      <LoginPromptModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        message="To save PGs to your personal student wishlist, please log in as a student."
      />
    </>
  );
};

export default PgCard;
