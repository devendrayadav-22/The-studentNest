import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({
  rating = 0,
  max = 5,
  interactive = false,
  onChange,
  size = 'md',
  showNumber = false,
  count = null
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const starSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  const currentScore = hoverRating || rating || 0;

  return (
    <div className="inline-flex items-center gap-1.5 select-none" role={interactive ? "radiogroup" : "img"} aria-label={`Rating: ${rating} out of ${max}`}>
      <div className="flex items-center">
        {Array.from({ length: max }, (_, index) => {
          const starValue = index + 1;
          const isFilled = currentScore >= starValue;
          const isHalf = !isFilled && currentScore >= starValue - 0.5;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              className={`${interactive ? 'cursor-pointer hover:scale-110 p-1 focus:outline-none focus:ring-1 focus:ring-amber-400 rounded' : 'cursor-default p-0.5'} transition-transform`}
              aria-label={`${starValue} Stars`}
            >
              <Star
                className={`${starSizes[size] || starSizes.md} transition-colors ${
                  isFilled
                    ? 'fill-[#FACC15] text-[#FACC15]'
                    : isHalf
                    ? 'fill-[#FACC15]/50 text-[#FACC15]'
                    : 'fill-slate-200 text-slate-300'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showNumber && (
        <span className="text-xs font-semibold text-slate-700 ml-0.5">
          {Number(rating).toFixed(1)}
        </span>
      )}

      {count !== null && (
        <span className="text-xs text-slate-500">
          ({count})
        </span>
      )}
    </div>
  );
};

export default StarRating;

