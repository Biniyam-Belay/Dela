import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Mail, 
  Clock, 
  ArrowRight,
  Sparkles,
  Heart
} from 'lucide-react';

const SellerApplicationSubmittedPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full backdrop-blur-sm mb-8">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-light mb-6 tracking-tight">
            Application Submitted
            <span className="block text-emerald-100 font-normal">Successfully!</span>
          </h1>
          
          <p className="text-xl text-white/90 font-light leading-relaxed max-w-2xl mx-auto">
            Thank you for your interest in joining our premium marketplace. 
            We've received your application and our team will review it shortly.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* What's Next Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-neutral-200 p-8 mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-full mb-4">
              <Clock className="h-8 w-8 text-neutral-700" />
            </div>
            <h2 className="text-2xl font-light text-neutral-900 mb-2">What Happens Next?</h2>
            <p className="text-neutral-600">Here's what you can expect from our review process</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">Application Review</h3>
              <p className="text-neutral-600 text-sm">
                Our team will carefully review your application within 2-3 business days.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-4">
                <CheckCircle className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">Verification Process</h3>
              <p className="text-neutral-600 text-sm">
                We may contact you for additional information or documentation if needed.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
                <Sparkles className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">Account Activation</h3>
              <p className="text-neutral-600 text-sm">
                Once approved, you'll receive your seller dashboard access credentials.
              </p>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-neutral-50 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-medium text-neutral-900 mb-4 flex items-center">
            <Mail className="mr-2 h-5 w-5 text-neutral-700" />
            Important Information
          </h3>
          <ul className="space-y-3 text-neutral-700">
            <li className="flex items-start">
              <div className="w-2 h-2 bg-neutral-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span className="text-sm">
                <strong>Email Confirmation:</strong> You should receive a confirmation email within the next few minutes. 
                Please check your spam folder if you don't see it.
              </span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-neutral-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span className="text-sm">
                <strong>Review Timeline:</strong> Our team typically reviews applications within 2-3 business days. 
                We'll email you with updates throughout the process.
              </span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-neutral-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span className="text-sm">
                <strong>Additional Documentation:</strong> If we need any additional information, 
                we'll reach out via the email address you provided in your application.
              </span>
            </li>
          </ul>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-2xl p-8 text-white">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-light mb-4">Thank You for Choosing Us</h3>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              We're excited about the possibility of working with you. In the meantime, 
              feel free to explore our marketplace and see what makes us special.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-white text-neutral-900 rounded-xl hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200"
              >
                Browse Marketplace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to="/collections"
                className="inline-flex items-center px-6 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200"
              >
                View Collections
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-12 text-center">
          <p className="text-neutral-600 text-sm mb-2">
            Have questions about your application?
          </p>
          <p className="text-neutral-900 font-medium">
            Contact us at{' '}
            <a 
              href="mailto:sellers@yourstore.com" 
              className="text-neutral-700 hover:text-neutral-900 underline"
            >
              sellers@yourstore.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SellerApplicationSubmittedPage;
