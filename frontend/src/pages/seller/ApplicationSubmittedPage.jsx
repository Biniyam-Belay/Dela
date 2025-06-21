import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiHome, FiMail } from 'react-icons/fi';

const ApplicationSubmittedPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <FiCheckCircle className="mx-auto h-24 w-24 text-green-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Application Submitted!
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Thank you for applying to become a seller on our platform.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">What happens next?</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                  1
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">
                  Our team will review your application within 2-3 business days.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                  2
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">
                  We'll contact you via email with the review results.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                  3
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">
                  Once approved, you'll gain access to your seller dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <FiMail className="h-5 w-5 text-blue-600 mr-2" />
            <p className="text-sm text-blue-800">
              <strong>Important:</strong> Check your email regularly for updates on your application status.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiHome className="mr-2 h-5 w-5" />
            Return to Home
          </Link>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Have questions? Contact us at{' '}
            <a href="mailto:support@suriaddis.com" className="text-blue-600 hover:text-blue-500">
              support@suriaddis.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSubmittedPage;
