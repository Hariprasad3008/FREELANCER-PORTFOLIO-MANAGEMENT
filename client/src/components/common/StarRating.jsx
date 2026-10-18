import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({ rating = 0, maxStars = 5, size = 16, interactive = false, onChange }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;

  return (
    <div className="inline-flex items-center gap-1">
      {Array.from({ length: maxStars }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = displayRating >= starValue;
        const isHalf = !isFilled && displayRating >= starValue - 0.5;

        return (
          <button
            type="button"
            key={index}
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
          >
            <Star
              size={size}
              className={`${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : isHalf
                  ? 'fill-amber-400/50 text-amber-400'
                  : 'text-slate-300'
              } transition-colors`}
            />
          </button>
        );
      })}
      {rating > 0 && !interactive && (
        <span className="text-xs font-semibold text-slate-700 ml-1">
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
};
