import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Helmet } from 'react-helmet';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>404 Not Found | SuriAddis</title>
        <meta
          name="description"
          content="Sorry, the page you are looking for does not exist. Return to the homepage or browse our products."
        />
      </Helmet>
      <div className="max-w-md w-full">
        {/* 404 Illustration */}
        <div className="text-center mb-8">
          <svg
            className="mx-auto h-48 w-48 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center">
          <h1 className="text-6xl sm:text-7xl font-light text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl sm:text-3xl font-light text-gray-800 mb-4">
            Page not found
          </h2>
          <p className="text-gray-600 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center px-6 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FiArrowLeft className="mr-2" />
              Go back
            </button>
            <Link
              to="/"
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-center"
            >
              Home page
            </Link>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Need help?{' '}
          <Link to="/contact" className="text-black hover:underline">
            Contact support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;