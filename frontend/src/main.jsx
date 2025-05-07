// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './contexts/authContext.jsx';
import { Provider } from 'react-redux';
import store from './store/store.js'; // Changed from named import to default import
import TOASTER_OPTIONS from './utils/toastOptions.js';
import CartInitializer from './components/CartInitializer.jsx';
import { Toaster } from 'react-hot-toast';
import { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Simple error boundary for production robustness
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    // Log error if needed
    // console.error(error, info);
  }
  render() {
    if (this.state.hasError) {
      return <div style={{padding:'2rem',textAlign:'center',color:'#18181b'}}>Something went wrong. Please refresh the page.</div>;
    }
    return this.props.children;
  }
}

// Create a client instance for React Query
const queryClient = new QueryClient();

// --- App Bootstrap ---
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Redux Store Provider */}
    <Provider store={store}>
      {/* React Router Provider */}
      <BrowserRouter>
        {/* React Query Provider */}
        <QueryClientProvider client={queryClient}>
          {/* Auth Context Provider */}
          <AuthProvider>
            {/* Cart Initialization on App Load */}
            <CartInitializer />
            {/* Global Toast Notifications */}
            <Toaster position="bottom-center" toastOptions={TOASTER_OPTIONS} />
            {/* App with Suspense and Error Boundary */}
            <ErrorBoundary>
              <Suspense fallback={<div style={{padding:'2rem',textAlign:'center'}}>Loading...</div>}>
                <App />
              </Suspense>
            </ErrorBoundary>
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);