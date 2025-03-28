import React from 'react';

const SkeletonCard = () => (
  <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white animate-pulse">
    <div className="w-full h-48 sm:h-56 md:h-64 bg-gray-300"></div> {/* Image Placeholder */}
    <div className="p-4">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div> {/* Title Placeholder */}
      <div className="h-3 bg-gray-300 rounded w-1/2 mb-4"></div> {/* Category/Subtitle Placeholder */}
      <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div> {/* Price Placeholder */}
      <div className="h-10 bg-gray-300 rounded w-full"></div> {/* Button Placeholder */}
    </div>
  </div>
);

export default SkeletonCard;