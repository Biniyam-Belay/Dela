import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/authContext.jsx';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { FiLogIn, FiMail, FiLock, FiArrowLeft } from 'react-icons/fi';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    await login(email, password);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Login | SuriAddis</title>
        <meta name="description" content="Sign in to your SuriAddis account to shop, track orders, and manage your profile." />
      </Helmet>
      <div className="max-w-md w-full mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-neutral-400 hover:text-black mb-6 transition-colors text-sm font-medium"
        >
          <FiArrowLeft className="mr-2" />
          Back
        </button>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow border border-neutral-100 p-7 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-black mb-2 tracking-tight">Sign in to your account</h1>
            <p className="text-neutral-500 text-sm">
              Don&apos;t have an account?{' '}
              <Link 
                to="/register" 
                className="text-black hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>

          {error && <ErrorMessage message={error} className="mb-6" />}

          <form className="space-y-5" onSubmit={handleSubmit}>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-neutral-50 text-black placeholder-neutral-400 text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 border-neutral-300 rounded text-black focus:ring-black"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-neutral-500">
                  Remember me
                </label>
              </div>
              <div className="text-xs">
                <Link 
                  to="/forgot-password" 
                  className="text-neutral-500 hover:text-black hover:underline"
                >
                  Forgot password?
                </Link>
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
                <>
                  <FiLogIn className="mr-2" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Social Login Options */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-neutral-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-neutral-200 rounded-lg shadow-sm bg-white text-xs font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Google
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-neutral-200 rounded-lg shadow-sm bg-white text-xs font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Facebook
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;