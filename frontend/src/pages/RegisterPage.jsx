import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/authContext.jsx'
import { useNavigate, Link } from 'react-router-dom';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState(''); // For password mismatch etc.

  const { register, isLoading, error: authError, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

   // Redirect if already logged in
   useEffect(() => {
    if (isAuthenticated) {
        navigate('/'); // Redirect to home if logged in
    }
   }, [isAuthenticated, navigate]);

   // Clear auth errors when component mounts or unmounts
   useEffect(() => {
       return () => {
          clearError();
       };
   }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError(); // Clear previous auth errors
    setFormError(''); // Clear previous form errors

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    if (password.length < 6) { // Example: Basic length validation
        setFormError('Password must be at least 6 characters long');
        return;
    }

    const success = await register(name, email, password);
    // Navigation is handled by the useEffect hook checking isAuthenticated
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-xl rounded-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
           {/* Display both form errors and auth errors */}
          {(formError || authError) && <ErrorMessage message={formError || authError} />}

          <div className="rounded-md shadow-sm space-y-3"> {/* Added space-y-3 */}
             <div>
               <label htmlFor="name" className="sr-only">Name</label>
               <input
                 id="name"
                 name="name"
                 type="text"
                 autoComplete="name"
                 required
                 className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                 placeholder="Your Name"
                 value={name}
                 onChange={(e) => setName(e.target.value)}
               />
             </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
             <div>
               <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
               <input
                 id="confirm-password"
                 name="confirm-password"
                 type="password"
                 autoComplete="new-password"
                 required
                 className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                 placeholder="Confirm Password"
                 value={confirmPassword}
                 onChange={(e) => setConfirmPassword(e.target.value)}
               />
             </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? <Spinner /> : 'Register'}
            </button>
          </div>
        </form>
         <div className="text-sm text-center">
             <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                 Already have an account? Sign in
             </Link>
         </div>
      </div>
    </div>
  );
};

export default RegisterPage;