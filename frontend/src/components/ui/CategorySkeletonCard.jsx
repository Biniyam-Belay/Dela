import React from 'react';

const CategorySkeletonCard = () => (
  <div className="group flex-shrink-0 w-40 md:w-48 lg:w-52 relative overflow-hidden rounded-xl shadow border border-neutral-200 bg-white animate-pulse transition-transform duration-300 hover:scale-105 hover:shadow-lg" style={{ minWidth: '10rem', maxWidth: '13rem' }}>
    <div className="aspect-[3/4] overflow-hidden relative rounded-t-xl">
      <div className="absolute inset-0 bg-gray-200 w-full h-full" />
    </div>
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4 rounded-xl">
      <div>
        <div className="h-5 w-24 bg-gray-300 rounded mb-1" /> {/* Name Placeholder */}
        <span className="inline-flex items-center h-3 w-16 bg-gray-400 rounded" /> {/* Button Placeholder */}
      </div>
    </div>
  </div>
);

export default CategorySkeletonCard;