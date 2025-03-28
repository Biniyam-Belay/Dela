import React from 'react';

const CategorySkeletonCard = () => (
    <div className="border rounded-lg p-6 text-center bg-white animate-pulse h-32 md:h-40 flex items-center justify-center">
         <div className="h-6 bg-gray-300 rounded w-3/4"></div> {/* Name Placeholder */}
    </div>
);

export default CategorySkeletonCard;