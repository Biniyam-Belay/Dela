import React, { useState, useEffect } from 'react';
import { 
  FiBell, 
  FiMail, 
  FiShield, 
  FiCreditCard,
  FiSettings,
  FiSave,
  FiToggleLeft,
  FiToggleRight,
  FiInfo
} from 'react-icons/fi';
import Spinner from '../../components/common/Spinner.jsx';

const SellerSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // Mock settings data for development
      const mockSettings = {
        notifications: {
          order_notifications: true,
          payment_notifications: true,
          marketing_emails: false,
          weekly_reports: true,
          review_notifications: true
        },
        business: {
          auto_accept_orders: false,
          processing_time_days: 3,
          return_policy_days: 30,
          minimum_order_amount: 0,
          free_shipping_threshold: 100
        },
        payout: {
          payout_method: 'bank_transfer',
          payout_frequency: 'weekly',
          minimum_payout_amount: 50,
          account_holder_name: 'The Test Boutique LLC',
          account_number: '****1234',
          routing_number: '****5678',
          bank_name: 'First National Bank'
        },
        privacy: {
          public_profile: true,
          show_contact_info: true,
          analytics_tracking: true,
          data_sharing: false
        }
      };
      setSettings(mockSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setErrors({ fetch: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (section, key) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key]
      }
    }));
  };

  const handleInputChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Success message would go here
    } catch (error) {
      console.error('Error saving settings:', error);
      setErrors({ save: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const ToggleButton = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-900">{label}</h4>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      <button
        onClick={onChange}
        className={`ml-4 relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account preferences and business settings</p>
        </div>
        <button
          onClick={handleSave}
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

      {errors.fetch && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{errors.fetch}</p>
        </div>
      )}

      {errors.save && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{errors.save}</p>
        </div>
      )}

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <FiBell className="h-5 w-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
        </div>
        
        <div className="space-y-1">
          <ToggleButton
            checked={settings.notifications?.order_notifications}
            onChange={() => handleToggle('notifications', 'order_notifications')}
            label="Order Notifications"
            description="Receive notifications when you receive new orders"
          />
          <ToggleButton
            checked={settings.notifications?.payment_notifications}
            onChange={() => handleToggle('notifications', 'payment_notifications')}
            label="Payment Notifications"
            description="Get notified about payments and payouts"
          />
          <ToggleButton
            checked={settings.notifications?.review_notifications}
            onChange={() => handleToggle('notifications', 'review_notifications')}
            label="Review Notifications"
            description="Receive notifications for new product reviews"
          />
          <ToggleButton
            checked={settings.notifications?.weekly_reports}
            onChange={() => handleToggle('notifications', 'weekly_reports')}
            label="Weekly Reports"
            description="Get weekly performance and sales reports"
          />
          <ToggleButton
            checked={settings.notifications?.marketing_emails}
            onChange={() => handleToggle('notifications', 'marketing_emails')}
            label="Marketing Emails"
            description="Receive tips, promotions, and platform updates"
          />
        </div>
      </div>

      {/* Business Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <FiSettings className="h-5 w-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Business Settings</h2>
        </div>
        
        <div className="space-y-6">
          <ToggleButton
            checked={settings.business?.auto_accept_orders}
            onChange={() => handleToggle('business', 'auto_accept_orders')}
            label="Auto-accept Orders"
            description="Automatically accept orders without manual review"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Processing Time (days)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.business?.processing_time_days || 3}
                onChange={(e) => handleInputChange('business', 'processing_time_days', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">How many days to process orders</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Return Policy (days)
              </label>
              <input
                type="number"
                min="0"
                max="90"
                value={settings.business?.return_policy_days || 30}
                onChange={(e) => handleInputChange('business', 'return_policy_days', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">Days allowed for returns</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Order Amount ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.business?.minimum_order_amount || 0}
                onChange={(e) => handleInputChange('business', 'minimum_order_amount', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">Minimum order value required</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Free Shipping Threshold ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.business?.free_shipping_threshold || 100}
                onChange={(e) => handleInputChange('business', 'free_shipping_threshold', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">Order value for free shipping</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payout Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <FiCreditCard className="h-5 w-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Payout Settings</h2>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payout Method
              </label>
              <select
                value={settings.payout?.payout_method || 'bank_transfer'}
                onChange={(e) => handleInputChange('payout', 'payout_method', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="paypal">PayPal</option>
                <option value="stripe">Stripe</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payout Frequency
              </label>
              <select
                value={settings.payout?.payout_frequency || 'weekly'}
                onChange={(e) => handleInputChange('payout', 'payout_frequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Payout Amount ($)
              </label>
              <input
                type="number"
                min="10"
                step="0.01"
                value={settings.payout?.minimum_payout_amount || 50}
                onChange={(e) => handleInputChange('payout', 'minimum_payout_amount', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">Minimum balance required for payout</p>
            </div>
          </div>

          {/* Bank Account Info (Display Only) */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Current Payout Account</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Account Holder:</span>
                <p className="font-medium">{settings.payout?.account_holder_name}</p>
              </div>
              <div>
                <span className="text-gray-600">Bank:</span>
                <p className="font-medium">{settings.payout?.bank_name}</p>
              </div>
              <div>
                <span className="text-gray-600">Account Number:</span>
                <p className="font-medium">{settings.payout?.account_number}</p>
              </div>
              <div>
                <span className="text-gray-600">Routing Number:</span>
                <p className="font-medium">{settings.payout?.routing_number}</p>
              </div>
            </div>
            <div className="mt-3">
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Update Payment Information
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <FiShield className="h-5 w-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Privacy & Security</h2>
        </div>
        
        <div className="space-y-1">
          <ToggleButton
            checked={settings.privacy?.public_profile}
            onChange={() => handleToggle('privacy', 'public_profile')}
            label="Public Profile"
            description="Make your store profile visible to customers"
          />
          <ToggleButton
            checked={settings.privacy?.show_contact_info}
            onChange={() => handleToggle('privacy', 'show_contact_info')}
            label="Show Contact Information"
            description="Display your contact details on your store page"
          />
          <ToggleButton
            checked={settings.privacy?.analytics_tracking}
            onChange={() => handleToggle('privacy', 'analytics_tracking')}
            label="Analytics Tracking"
            description="Allow tracking for performance insights"
          />
          <ToggleButton
            checked={settings.privacy?.data_sharing}
            onChange={() => handleToggle('privacy', 'data_sharing')}
            label="Data Sharing"
            description="Share anonymized data to improve platform features"
          />
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 rounded-lg p-6">
        <div className="flex items-start">
          <FiInfo className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">Need Help?</h3>
            <p className="text-sm text-blue-700 mt-1">
              Visit our Help Center or contact support if you have questions about these settings.
            </p>
            <div className="mt-3 space-x-4">
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Help Center
              </button>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerSettingsPage;
