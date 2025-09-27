import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ 
  rating = 0, 
  maxRating = 5, 
  size = 'md', 
  showNumber = false, 
  interactive = false,
  onRatingChange = null 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const handleStarClick = (starValue) => {
    if (interactive && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const renderStars = () => {
    return Array.from({ length: maxRating }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= rating;
      
      return (
        <button
          key={index}
          type="button"
          className={`${sizeClasses[size]} transition-colors duration-200 ${
            isFilled 
              ? 'text-yellow-400' 
              : 'text-gray-300'
          } ${interactive ? 'hover:text-yellow-500 cursor-pointer' : 'cursor-default'}`}
          onClick={() => handleStarClick(starValue)}
          disabled={!interactive}
        >
          <Star className="w-full h-full fill-current" />
        </button>
      );
    });
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center space-x-1">
        {renderStars()}
      </div>
      {showNumber && (
        <span className="text-sm text-gray-600 ml-2">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
