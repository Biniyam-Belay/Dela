import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { applyForSellerAccount } from '../../services/sellerApi.js';
import { 
  ArrowLeft, 
  Store, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  CreditCard, 
  Globe, 
  Hash, 
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

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
  const [currentStep, setCurrentStep] = useState(1);

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
      navigate('/seller/application-submitted');
    } catch (error) {
      console.error('Error submitting seller application:', error);
      setError(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, name: 'Business Details', icon: Store, description: 'Tell us about your business' },
    { id: 2, name: 'Contact & Financial', icon: CreditCard, description: 'Contact and payment information' },
    { id: 3, name: 'Review & Submit', icon: CheckCircle, description: 'Review your application' }
  ];

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.business_name && formData.business_description && formData.business_type;
      case 2:
        return formData.business_email && formData.business_phone && formData.business_address && 
               formData.bank_name && formData.account_holder_name && formData.bank_account_number;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Link
            to="/"
            className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                <Sparkles className="h-8 w-8 text-amber-300" />
              </div>
              <span className="text-amber-300 text-sm font-medium tracking-wide uppercase">
                Partnership Opportunity
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-light mb-6 tracking-tight">
              Join Our Elite
              <span className="block text-amber-300 font-normal">Seller Community</span>
            </h1>
            
            <p className="text-xl text-white/80 font-light leading-relaxed max-w-2xl">
              Transform your business with our premium marketplace. Connect with discerning customers 
              who value quality and craftsmanship.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`
                      flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                      ${isActive 
                        ? 'bg-neutral-900 border-neutral-900 text-white' 
                        : isCompleted 
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'bg-white border-neutral-300 text-neutral-500'
                      }
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>
                    <div className="mt-3 text-center">
                      <p className={`text-sm font-medium ${isActive ? 'text-neutral-900' : 'text-neutral-600'}`}>
                        {step.name}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1 max-w-32">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`
                      w-20 h-0.5 mx-4 transition-colors duration-300
                      ${currentStep > step.id ? 'bg-emerald-500' : 'bg-neutral-300'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-3xl shadow-xl border border-neutral-200 overflow-hidden">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-6 m-6 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}

            <div className="p-8">
              {/* Step 1: Business Details */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-full mb-4">
                      <Store className="h-8 w-8 text-neutral-700" />
                    </div>
                    <h2 className="text-2xl font-light text-neutral-900 mb-2">Tell Us About Your Business</h2>
                    <p className="text-neutral-600">Share the details that make your business unique</p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="business_name" className="block text-sm font-medium text-neutral-700 mb-2">
                          Business Name *
                        </label>
                        <input
                          type="text"
                          id="business_name"
                          name="business_name"
                          required
                          value={formData.business_name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent transition-all duration-200"
                          placeholder="Your Business Name"
                        />
                      </div>
                      <div>
                        <label htmlFor="business_type" className="block text-sm font-medium text-neutral-700 mb-2">
                          Business Type *
                        </label>
                        <select
                          id="business_type"
                          name="business_type"
                          required
                          value={formData.business_type}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent transition-all duration-200"
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
                    
                    <div>
                      <label htmlFor="business_description" className="block text-sm font-medium text-neutral-700 mb-2">
                        Business Description *
                      </label>
                      <textarea
                        id="business_description"
                        name="business_description"
                        required
                        rows={5}
                        value={formData.business_description}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent transition-all duration-200 resize-none"
                        placeholder="Tell us about your business, the products you offer, and what makes you unique..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Contact & Financial */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-full mb-4">
                      <CreditCard className="h-8 w-8 text-neutral-700" />
                    </div>
                    <h2 className="text-2xl font-light text-neutral-900 mb-2">Contact & Payment Details</h2>
                    <p className="text-neutral-600">Help us connect with you and process payments</p>
                  </div>

                  <div className="space-y-8">
                    {/* Contact Information */}
                    <div>
                      <h3 className="text-lg font-medium text-neutral-900 mb-4 flex items-center">
                        <User className="mr-2 h-5 w-5" />
                        Contact Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="business_email" className="block text-sm font-medium text-neutral-700 mb-2">
                            Business Email *
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                            <input
                              type="email"
                              id="business_email"
                              name="business_email"
                              required
                              value={formData.business_email}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent transition-all duration-200"
                              placeholder="business@example.com"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="business_phone" className="block text-sm font-medium text-neutral-700 mb-2">
                            Business Phone *
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                            <input
                              type="tel"
                              id="business_phone"
                              name="business_phone"
                              required
                              value={formData.business_phone}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent transition-all duration-200"
                              placeholder="+1 (555) 123-4567"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-6">
                        <label htmlFor="business_address" className="block text-sm font-medium text-neutral-700 mb-2">
                          Business Address *
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                          <textarea
                            id="business_address"
                            name="business_address"
                            required
                            rows={3}
                            value={formData.business_address}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent transition-all duration-200 resize-none"
                            placeholder="Your business address..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Financial Information */}
                    <div>
                      <h3 className="text-lg font-medium text-neutral-900 mb-4 flex items-center">
                        <Building2 className="mr-2 h-5 w-5" />
                        Financial Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="tax_id" className="block text-sm font-medium text-neutral-700 mb-2">
                            Tax ID / Registration Number
                          </label>
                          <div className="relative">
                            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                            <input
                              type="text"
                              id="tax_id"
                              name="tax_id"
                              value={formData.tax_id}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent transition-all duration-200"
                              placeholder="12-3456789"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="bank_name" className="block text-sm font-medium text-neutral-700 mb-2">
                            Bank Name *
                          </label>
                          <input
                            type="text"
                            id="bank_name"
                            name="bank_name"
                            required
                            value={formData.bank_name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent transition-all duration-200"
                            placeholder="Bank of America"
                          />
                        </div>
                        <div>
                          <label htmlFor="account_holder_name" className="block text-sm font-medium text-neutral-700 mb-2">
                            Account Holder Name *
                          </label>
                          <input
                            type="text"
                            id="account_holder_name"
                            name="account_holder_name"
                            required
                            value={formData.account_holder_name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent transition-all duration-200"
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <label htmlFor="bank_account_number" className="block text-sm font-medium text-neutral-700 mb-2">
                            Bank Account Number *
                          </label>
                          <input
                            type="text"
                            id="bank_account_number"
                            name="bank_account_number"
                            required
                            value={formData.bank_account_number}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent transition-all duration-200"
                            placeholder="1234567890"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Optional Information */}
                    <div>
                      <h3 className="text-lg font-medium text-neutral-900 mb-4">
                        Optional Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="website_url" className="block text-sm font-medium text-neutral-700 mb-2">
                            Website URL
                          </label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                            <input
                              type="url"
                              id="website_url"
                              name="website_url"
                              value={formData.website_url}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent transition-all duration-200"
                              placeholder="https://yourbusiness.com"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="social_media_links" className="block text-sm font-medium text-neutral-700 mb-2">
                            Social Media Links
                          </label>
                          <input
                            type="text"
                            id="social_media_links"
                            name="social_media_links"
                            value={formData.social_media_links}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent transition-all duration-200"
                            placeholder="@yourbusiness, facebook.com/yourbusiness"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Submit */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-full mb-4">
                      <CheckCircle className="h-8 w-8 text-neutral-700" />
                    </div>
                    <h2 className="text-2xl font-light text-neutral-900 mb-2">Review Your Application</h2>
                    <p className="text-neutral-600">Please review your information before submitting</p>
                  </div>

                  <div className="bg-neutral-50 rounded-2xl p-6 space-y-6">
                    {/* Business Details Review */}
                    <div>
                      <h3 className="text-lg font-medium text-neutral-900 mb-4 flex items-center">
                        <Store className="mr-2 h-5 w-5" />
                        Business Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-neutral-700">Business Name:</span>
                          <p className="text-neutral-900">{formData.business_name || 'Not provided'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-neutral-700">Business Type:</span>
                          <p className="text-neutral-900">{formData.business_type || 'Not provided'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <span className="font-medium text-neutral-700">Description:</span>
                          <p className="text-neutral-900 mt-1">{formData.business_description || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information Review */}
                    <div>
                      <h3 className="text-lg font-medium text-neutral-900 mb-4 flex items-center">
                        <User className="mr-2 h-5 w-5" />
                        Contact Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-neutral-700">Email:</span>
                          <p className="text-neutral-900">{formData.business_email || 'Not provided'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-neutral-700">Phone:</span>
                          <p className="text-neutral-900">{formData.business_phone || 'Not provided'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <span className="font-medium text-neutral-700">Address:</span>
                          <p className="text-neutral-900 mt-1">{formData.business_address || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Financial Information Review */}
                    <div>
                      <h3 className="text-lg font-medium text-neutral-900 mb-4 flex items-center">
                        <CreditCard className="mr-2 h-5 w-5" />
                        Financial Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-neutral-700">Bank Name:</span>
                          <p className="text-neutral-900">{formData.bank_name || 'Not provided'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-neutral-700">Account Holder:</span>
                          <p className="text-neutral-900">{formData.account_holder_name || 'Not provided'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-neutral-700">Tax ID:</span>
                          <p className="text-neutral-900">{formData.tax_id || 'Not provided'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-neutral-700">Account Number:</span>
                          <p className="text-neutral-900">{formData.bank_account_number ? '****' + formData.bank_account_number.slice(-4) : 'Not provided'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Optional Information Review */}
                    {(formData.website_url || formData.social_media_links) && (
                      <div>
                        <h3 className="text-lg font-medium text-neutral-900 mb-4">
                          Additional Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {formData.website_url && (
                            <div>
                              <span className="font-medium text-neutral-700">Website:</span>
                              <p className="text-neutral-900">{formData.website_url}</p>
                            </div>
                          )}
                          {formData.social_media_links && (
                            <div>
                              <span className="font-medium text-neutral-700">Social Media:</span>
                              <p className="text-neutral-900">{formData.social_media_links}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-800 mb-1">Application Review Process</p>
                        <p className="text-amber-700">
                          Your application will be reviewed within 2-3 business days. We'll contact you via email 
                          with the next steps or if we need any additional information.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 border-t border-neutral-200">
                <div>
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="inline-flex items-center px-6 py-3 border border-neutral-300 rounded-xl text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500 transition-all duration-200"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </button>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-6 py-3 border border-neutral-300 rounded-xl text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  
                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!validateStep(currentStep)}
                      className="inline-flex items-center px-8 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Continue
                      <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting || !validateStep(1) || !validateStep(2)}
                      className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-xl hover:from-neutral-800 hover:to-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Submit Application
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellerApplicationPage;
