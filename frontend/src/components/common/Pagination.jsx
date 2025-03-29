import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) {
        return null; // Don't render pagination if only one page
    }

    const pageNumbers = [];
    // Simple pagination logic: Show first, last, current, and neighbors
    const maxPagesToShow = 5; // Adjust how many page numbers to show around current
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Adjust startPage if endPage reaches the limit
    if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    return (
        <nav className="mt-6 flex items-center justify-center" aria-label="Pagination">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-3 py-1 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Previous
            </button>

            {startPage > 1 && ( // Show first page and ellipsis if needed
                <>
                    <button onClick={() => onPageChange(1)} className="relative inline-flex items-center px-3 py-1 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">1</button>
                    {startPage > 2 && <span className="relative inline-flex items-center px-3 py-1 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>}
                </>
            )}

            {pageNumbers.map(number => (
                <button
                    key={number}
                    onClick={() => onPageChange(number)}
                    aria-current={number === currentPage ? 'page' : undefined}
                    className={`relative inline-flex items-center px-3 py-1 border-t border-b border-gray-300 text-sm font-medium ${
                        number === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    {number}
                </button>
            ))}

             {endPage < totalPages && ( // Show ellipsis and last page if needed
                <>
                     {endPage < totalPages - 1 && <span className="relative inline-flex items-center px-3 py-1 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>}
                     <button onClick={() => onPageChange(totalPages)} className="relative inline-flex items-center px-3 py-1 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">{totalPages}</button>
                </>
            )}


            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-3 py-1 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
        </nav>
    );
};

export default Pagination;