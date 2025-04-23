// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './contexts/authContext.jsx';
import { Provider } from 'react-redux';
import { store } from './store/store.js';
import { useEffect } from 'react';
import { fetchCart } from './store/cartSlice';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 15,
    },
  },
});

function CartInitializer() {
  // Dispatch fetchCart on app load
  const dispatch = store.dispatch;
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);
  return null;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <BrowserRouter>
          <AuthProvider>
            <CartInitializer />
            <Toaster position="top-right" />
            <App />
          </AuthProvider>
        </BrowserRouter>
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>
);