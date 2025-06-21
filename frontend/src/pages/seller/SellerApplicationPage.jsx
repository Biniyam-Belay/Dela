import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { applyForSellerAccount } from '../../services/sellerApi.js';
import { FiArrowLeft, FiPackage, FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const SellerApplicationPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    business_name: '',
    business_description: '',
    business_address: '',
    business_phone: '',
    business_email: '',
    business_type: '',
    tax_id: '',
    bank_account_number: '',
    bank_name: '',
    account_holder_name: '',
    website_url: '',
    social_media_links: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await applyForSellerAccount(formData);
      // Redirect to a success page or show success message
      navigate('/seller/application-submitted');
    } catch (error) {
      console.error('Error submitting seller application:', error);
      setError(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <div className="text-center">
            <FiPackage className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Become a Seller</h1>
            <p className="mt-2 text-lg text-gray-600">
              Join our marketplace and start selling your products
            </p>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
            <h2 className="text-xl font-semibold text-gray-900">Seller Application</h2>
            <p className="text-sm text-gray-600 mt-1">
              Please fill out all required information to apply for a seller account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Business Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FiPackage className="mr-2 h-5 w-5" />
                Business Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="business_name" className="block text-sm font-medium text-gray-700">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    id="business_name"
                    name="business_name"
                    required
                    value={formData.business_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="business_type" className="block text-sm font-medium text-gray-700">
                    Business Type *
                  </label>
                  <select
                    id="business_type"
                    name="business_type"
                    required
                    value={formData.business_type}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select business type</option>
                    <option value="individual">Individual Seller</option>
                    <option value="sole_proprietorship">Sole Proprietorship</option>
                    <option value="partnership">Partnership</option>
                    <option value="corporation">Corporation</option>
                    <option value="llc">LLC</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="business_description" className="block text-sm font-medium text-gray-700">
                  Business Description *
                </label>
                <textarea
                  id="business_description"
                  name="business_description"
                  required
                  rows={4}
                  value={formData.business_description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your business and the products you plan to sell..."
                />
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FiUser className="mr-2 h-5 w-5" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="business_email" className="block text-sm font-medium text-gray-700">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    id="business_email"
                    name="business_email"
                    required
                    value={formData.business_email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="business_phone" className="block text-sm font-medium text-gray-700">
                    Business Phone *
                  </label>
                  <input
                    type="tel"
                    id="business_phone"
                    name="business_phone"
                    required
                    value={formData.business_phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="business_address" className="block text-sm font-medium text-gray-700">
                  Business Address *
                </label>
                <textarea
                  id="business_address"
                  name="business_address"
                  required
                  rows={3}
                  value={formData.business_address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Financial Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FiMapPin className="mr-2 h-5 w-5" />
                Financial Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tax_id" className="block text-sm font-medium text-gray-700">
                    Tax ID / Registration Number
                  </label>
                  <input
                    type="text"
                    id="tax_id"
                    name="tax_id"
                    value={formData.tax_id}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    id="bank_name"
                    name="bank_name"
                    required
                    value={formData.bank_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="account_holder_name" className="block text-sm font-medium text-gray-700">
                    Account Holder Name *
                  </label>
                  <input
                    type="text"
                    id="account_holder_name"
                    name="account_holder_name"
                    required
                    value={formData.account_holder_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="bank_account_number" className="block text-sm font-medium text-gray-700">
                    Bank Account Number *
                  </label>
                  <input
                    type="text"
                    id="bank_account_number"
                    name="bank_account_number"
                    required
                    value={formData.bank_account_number}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Optional Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Optional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="website_url" className="block text-sm font-medium text-gray-700">
                    Website URL
                  </label>
                  <input
                    type="url"
                    id="website_url"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://"
                  />
                </div>
                <div>
                  <label htmlFor="social_media_links" className="block text-sm font-medium text-gray-700">
                    Social Media Links
                  </label>
                  <input
                    type="text"
                    id="social_media_links"
                    name="social_media_links"
                    value={formData.social_media_links}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Instagram, Facebook, etc."
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellerApplicationPage;
