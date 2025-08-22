import React from 'react';

const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full font-sans animate-pulse">
      {/* Image Placeholder */}
      <div className="w-full h-48 bg-gray-300"></div>

      <div className="p-4">
        {/* Title Placeholder */}
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
        
        {/* Subtitle Placeholder */}
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-6"></div>

        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          {/* Price Placeholder */}
          <div>
            <div className="h-4 bg-gray-300 rounded w-16 mb-2"></div>
            <div className="h-6 bg-gray-300 rounded w-24"></div>
          </div>
          
          {/* Button Placeholder */}
          <div className="h-10 bg-gray-300 rounded-lg w-24"></div>
        </div>
      </div>
    </div>
  );
};

export default CardSkeleton;
