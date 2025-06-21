import React, { useState, useEffect } from 'react';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiSave,
  FiCamera,
  FiEdit3,
  FiCheck,
  FiX
} from 'react-icons/fi';
import { getSellerProfile, updateSellerProfile } from '../../services/sellerApi.js';
import Spinner from '../../components/common/Spinner.jsx';

const SellerProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getSellerProfile();
      setProfile(data);
      setFormData(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Use mock data for development
      const mockProfile = getMockProfile();
      setProfile(mockProfile);
      setFormData(mockProfile);
    } finally {
      setLoading(false);
    }
  };

  const getMockProfile = () => ({
    id: 1,
    user_id: 'user-123',
    store_name: 'The Test Boutique',
    store_description: 'Curating unique fashion pieces and lifestyle products for the modern consumer.',
    store_logo_url: null,
    contact_email: 'seller@testboutique.com',
    contact_phone: '+1-555-0123',
    business_address: '123 Fashion Street, Style City, SC 12345',
    business_registration_number: 'REG-2024-001',
    tax_id: 'TAX-123456789',
    bank_account_details: {
      account_holder: 'The Test Boutique LLC',
      bank_name: 'First National Bank',
      account_number: '****1234',
      routing_number: '****5678'
    },
    status: 'active',
    approval_date: '2024-01-01T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.store_name?.trim()) {
      newErrors.store_name = 'Store name is required';
    }

    if (!formData.store_description?.trim()) {
      newErrors.store_description = 'Store description is required';
    }

    if (!formData.contact_email?.trim()) {
      newErrors.contact_email = 'Contact email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contact_email)) {
      newErrors.contact_email = 'Please enter a valid email address';
    }

    if (!formData.contact_phone?.trim()) {
      newErrors.contact_phone = 'Contact phone is required';
    }

    if (!formData.business_address?.trim()) {
      newErrors.business_address = 'Business address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const updatedProfile = await updateSellerProfile(formData);
      setProfile(updatedProfile);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ submit: error.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setErrors({});
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seller Profile</h1>
          <p className="text-gray-600 mt-1">Manage your store information and business details</p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <FiEdit3 className="mr-2 h-4 w-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="inline-flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <FiX className="mr-2 h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <Spinner size="small" />
              ) : (
                <FiSave className="mr-2 h-4 w-4" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Profile Status */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full mr-3 ${
              profile.status === 'active' ? 'bg-green-500' : 
              profile.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Account Status</h3>
              <p className="text-sm text-gray-600">
                Your seller account is <span className="font-semibold capitalize">{profile.status}</span>
                {profile.approval_date && (
                  <span> since {new Date(profile.approval_date).toLocaleDateString()}</span>
                )}
              </p>
            </div>
          </div>
          {profile.status === 'active' && (
            <div className="flex items-center text-green-600">
              <FiCheck className="h-5 w-5" />
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Store Information</h2>
          
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-red-800">{errors.submit}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Store Logo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Logo
              </label>
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  {formData.store_logo_url ? (
                    <img
                      src={formData.store_logo_url}
                      alt="Store logo"
                      className="h-full w-full object-cover rounded-lg"
                    />
                  ) : (
                    <FiCamera className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                {editing && (
                  <div>
                    <input
                      type="url"
                      name="store_logo_url"
                      value={formData.store_logo_url || ''}
                      onChange={handleInputChange}
                      placeholder="Enter logo URL"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload your logo or enter a URL</p>
                  </div>
                )}
              </div>
            </div>

            {/* Store Name */}
            <div>
              <label htmlFor="store_name" className="block text-sm font-medium text-gray-700">
                Store Name *
              </label>
              <input
                type="text"
                id="store_name"
                name="store_name"
                value={formData.store_name || ''}
                onChange={handleInputChange}
                readOnly={!editing}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  !editing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                } ${errors.store_name ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.store_name && <p className="mt-1 text-sm text-red-600">{errors.store_name}</p>}
            </div>

            {/* Contact Email */}
            <div>
              <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">
                Contact Email *
              </label>
              <input
                type="email"
                id="contact_email"
                name="contact_email"
                value={formData.contact_email || ''}
                onChange={handleInputChange}
                readOnly={!editing}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  !editing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                } ${errors.contact_email ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.contact_email && <p className="mt-1 text-sm text-red-600">{errors.contact_email}</p>}
            </div>

            {/* Store Description */}
            <div className="md:col-span-2">
              <label htmlFor="store_description" className="block text-sm font-medium text-gray-700">
                Store Description *
              </label>
              <textarea
                id="store_description"
                name="store_description"
                rows={4}
                value={formData.store_description || ''}
                onChange={handleInputChange}
                readOnly={!editing}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  !editing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                } ${errors.store_description ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Tell customers about your store..."
              />
              {errors.store_description && <p className="mt-1 text-sm text-red-600">{errors.store_description}</p>}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <input
                type="tel"
                id="contact_phone"
                name="contact_phone"
                value={formData.contact_phone || ''}
                onChange={handleInputChange}
                readOnly={!editing}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  !editing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                } ${errors.contact_phone ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.contact_phone && <p className="mt-1 text-sm text-red-600">{errors.contact_phone}</p>}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="business_address" className="block text-sm font-medium text-gray-700">
                Business Address *
              </label>
              <textarea
                id="business_address"
                name="business_address"
                rows={3}
                value={formData.business_address || ''}
                onChange={handleInputChange}
                readOnly={!editing}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  !editing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                } ${errors.business_address ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Enter your business address..."
              />
              {errors.business_address && <p className="mt-1 text-sm text-red-600">{errors.business_address}</p>}
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="business_registration_number" className="block text-sm font-medium text-gray-700">
                Registration Number
              </label>
              <input
                type="text"
                id="business_registration_number"
                name="business_registration_number"
                value={formData.business_registration_number || ''}
                onChange={handleInputChange}
                readOnly={!editing}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  !editing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                }`}
              />
            </div>

            <div>
              <label htmlFor="tax_id" className="block text-sm font-medium text-gray-700">
                Tax ID
              </label>
              <input
                type="text"
                id="tax_id"
                name="tax_id"
                value={formData.tax_id || ''}
                onChange={handleInputChange}
                readOnly={!editing}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  !editing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <span className="text-gray-600">Account Created:</span>
              <p className="font-medium">{new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-gray-600">Last Updated:</span>
              <p className="font-medium">{new Date(profile.updated_at).toLocaleDateString()}</p>
            </div>
            {profile.approval_date && (
              <div>
                <span className="text-gray-600">Approved On:</span>
                <p className="font-medium">{new Date(profile.approval_date).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default SellerProfilePage;
