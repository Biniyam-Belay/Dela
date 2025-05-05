import React from 'react';

const CategorySkeletonCard = () => (
  <div className="flex-shrink-0 w-48 md:w-52 lg:w-56 animate-pulse"> {/* Match carousel item width */}
    <div className="h-64 bg-neutral-200 rounded-xl"></div> {/* Match carousel item height */}
  </div>
);

export default CategorySkeletonCard;