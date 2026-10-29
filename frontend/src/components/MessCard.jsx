import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Truck } from 'lucide-react';
import Card from './Card';
import Badge from './Badge';
import StarRating from './StarRating';
import ImageWithFallback from './ImageWithFallback';
import { formatPrice, formatDistance } from '../utils/formatters';

export const MessCard = ({ mess, className = '' }) => {
  const coverImage = mess.images && mess.images.length > 0 ? mess.images[0] : null;

  const foodTypeVariant =
    mess.foodType === 'VEG' ? 'veg' : mess.foodType === 'NONVEG' ? 'nonveg' : 'both';

  const isOpen = Boolean(mess.isOpen ?? mess.open);

  return (
    <Card hover className={`overflow-hidden flex flex-col group ${className}`}>
      {/* Cover Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <Link to={`/messes/${mess.id}`} className="block w-full h-full">
          <ImageWithFallback
            src={coverImage}
            alt={mess.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            fallbackType="mess"
          />
        </Link>

        {/* Badges on image */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          <Badge variant={foodTypeVariant} size="xs" />
          {mess.verified && <Badge variant="verified" size="xs" />}
        </div>

        {/* Open/Closed status tag */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <Badge variant={isOpen ? 'open' : 'closed'} size="xs" />
        </div>

        {/* Distance pill */}
        <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1 shadow-sm">
          <MapPin className="w-3 h-3 text-amber-400" />
          {formatDistance(mess.distanceKm)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{mess.openTime} - {mess.closeTime}</span>
          </div>

          <Link to={`/messes/${mess.id}`}>
            <h3 className="font-bold text-slate-900 text-base leading-snug hover:text-amber-600 transition-colors line-clamp-1">
              {mess.name}
            </h3>
          </Link>

          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            {mess.address}
          </p>

          {mess.deliveryArea && (
            <div className="mt-2.5 flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100/80 px-2 py-1 rounded-md">
              <Truck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">Delivers to: {mess.deliveryArea}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3.5 mt-3 border-t border-slate-200/70">
          <div>
            <div className="text-xs font-bold text-slate-900">
              {formatPrice(mess.pricePerMeal)} <span className="font-normal text-[11px] text-slate-500">/thali</span>
            </div>
            {mess.monthlyPrice && (
              <div className="text-[11px] text-slate-500">
                {formatPrice(mess.monthlyPrice)} /month
              </div>
            )}
          </div>

          <div className="flex flex-col items-end">
            <StarRating rating={mess.averageRating} count={mess.reviewCount} showNumber size="xs" />
            <Link
              to={`/messes/${mess.id}`}
              className="mt-1 text-xs font-semibold text-amber-700 hover:text-amber-800"
            >
              Menu & Details &rarr;
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MessCard;

