import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/authContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { FiUser, FiMail, FiLock, FiArrowLeft } from 'react-icons/fi';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState('');
  const { register, isLoading, error: authError, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setFormError('');

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    await register(formData.name, formData.email, formData.password);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-neutral-400 hover:text-black mb-6 transition-colors text-sm font-medium"
        >
          <FiArrowLeft className="mr-2" />
          Back
        </button>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow border border-neutral-100 p-7 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-black mb-2 tracking-tight">Create your account</h1>
            <p className="text-neutral-500 text-sm">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-black hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>

          {(formError || authError) && <ErrorMessage message={formError || authError} className="mb-6" />}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-neutral-500 mb-1">
                Full name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-neutral-300" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-neutral-50 text-black placeholder-neutral-400 text-sm"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-neutral-500 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-neutral-300" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-neutral-50 text-black placeholder-neutral-400 text-sm"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-neutral-500 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-neutral-300" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-neutral-50 text-black placeholder-neutral-400 text-sm"
                  placeholder="•••••••• (min 6 characters)"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-neutral-500 mb-1">
                Confirm password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-neutral-300" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-neutral-50 text-black placeholder-neutral-400 text-sm"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-3 px-4 rounded-lg text-white font-semibold text-sm ${
                isLoading ? 'bg-neutral-300' : 'bg-black hover:bg-neutral-800'
              } transition-colors`}
            >
              {isLoading ? (
                <Spinner size="sm" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Terms and Conditions */}
          <p className="mt-6 text-xs text-neutral-400 text-center">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-black">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="underline hover:text-black">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;