import React from 'react';
// Updated icons: Replaced FiStore with FiHome
import { FiSave, FiHome, FiCreditCard, FiTruck, FiUser } from 'react-icons/fi';

// Reusable Card component for settings sections
const SettingsCard = ({ title, description, icon: Icon, children }) => (
  <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
    <div className="p-6 border-b border-slate-100 flex items-start gap-4">
      {Icon && <Icon className="h-6 w-6 text-slate-500 mt-1 flex-shrink-0" />}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
    </div>
    <div className="p-6 space-y-4">
      {children}
    </div>
  </div>
);

// Reusable Input component
const SettingsInput = ({ label, id, type = 'text', placeholder, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      id={id}
      placeholder={placeholder}
      className="block w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-sm"
      {...props}
    />
    {/* Add error display if needed */}
  </div>
);

const AdminSettingsPage = () => {
  // Add state and form handling (e.g., react-hook-form) here later

  const handleSave = (section) => (e) => {
    e.preventDefault();
    console.log(`Saving ${section} settings...`);
    // Add API call logic here
  };

  return (
    <div className="space-y-8">
      {/* Header (Optional - Title is in AdminLayout) */}
      {/* <h1 className="text-2xl font-semibold text-slate-900">Settings</h1> */}

      {/* Store Information */}
      <SettingsCard title="Store Information" description="Basic details about your store" icon={FiHome}>
        <form onSubmit={handleSave('Store Info')} className="space-y-4">
          <SettingsInput label="Store Name" id="storeName" placeholder="SuriAddis" />
          <SettingsInput label="Contact Email" id="storeEmail" type="email" placeholder="contact@suriaddis.com" />
          <SettingsInput label="Store Address" id="storeAddress" placeholder="123 Main St, Addis Ababa" />
          {/* Add more fields as needed */}
          <div className="flex justify-end pt-4">
            <button type="submit" className="flex items-center gap-2 px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 text-sm">
              <FiSave size={16} /> Save Changes
            </button>
          </div>
        </form>
      </SettingsCard>

      {/* Payment Gateways */}
      <SettingsCard title="Payment Gateways" description="Configure how customers can pay" icon={FiCreditCard}>
        {/* Placeholder content - Replace with actual gateway configuration */}
        <p className="text-sm text-slate-500">Payment gateway configuration options will appear here.</p>
        <div className="flex justify-end pt-4">
          <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 text-sm">
            Configure Payments
          </button>
        </div>
      </SettingsCard>

      {/* Shipping Options */}
      <SettingsCard title="Shipping Options" description="Set up shipping zones and rates" icon={FiTruck}>
        {/* Placeholder content */}
        <p className="text-sm text-slate-500">Shipping zone and rate settings will appear here.</p>
         <div className="flex justify-end pt-4">
          <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 text-sm">
            Manage Shipping
          </button>
        </div>
      </SettingsCard>

      {/* Account Settings */}
      <SettingsCard title="Admin Account" description="Manage your administrator profile" icon={FiUser}>
        <form onSubmit={handleSave('Admin Account')} className="space-y-4">
          <SettingsInput label="Your Name" id="adminName" placeholder="Admin User" />
          <SettingsInput label="Your Email" id="adminEmail" type="email" placeholder="admin@example.com" readOnly className="bg-slate-100 cursor-not-allowed" />
          <SettingsInput label="New Password" id="adminPassword" type="password" placeholder="Leave blank to keep current" />
          <SettingsInput label="Confirm New Password" id="adminConfirmPassword" type="password" placeholder="Confirm new password" />
          <div className="flex justify-end pt-4">
            <button type="submit" className="flex items-center gap-2 px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 text-sm">
              <FiSave size={16} /> Update Profile
            </button>
          </div>
        </form>
      </SettingsCard>
    </div>
  );
};

export default AdminSettingsPage;
