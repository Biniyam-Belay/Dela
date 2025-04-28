import React from 'react';

const CategorySkeletonCard = () => (
  <div className="group flex-shrink-0 w-40 md:w-48 lg:w-52 relative overflow-hidden rounded-xl shadow border border-neutral-200 bg-white animate-pulse" style={{ minWidth: '10rem', maxWidth: '13rem' }}>
    <div className="aspect-[3/4] overflow-hidden relative rounded-t-xl bg-gray-200">
      {/* Image placeholder */}
    </div>
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4 rounded-xl">
      <div>
        <div className="h-5 w-24 bg-gray-300 rounded mb-2"></div> {/* Name Placeholder */}
        <div className="h-3 w-12 bg-gray-300 rounded"></div> {/* Button Placeholder */}
      </div>
    </div>
  </div>
);

export default CategorySkeletonCard;