import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../services/supabaseClient'; // Adjust path if needed
import Spinner from '../components/common/Spinner'; // Assuming you have a Spinner
import { store } from '../store/store';
import { clearLocalCartAndState, mergeLocalCartWithBackend } from '../store/cartSlice';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Start loading until session is checked
    const [error, setError] = useState(null);

    // Check initial session and subscribe to auth changes
    useEffect(() => {
        setIsLoading(true);
        setError(null);

        // 1. Check for existing Supabase session on initial load
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setUser(session.user);
                setIsAuthenticated(true);
                localStorage.setItem('accessToken', session.access_token); // Store token
                console.log("Auth Context: Supabase session found on initial load", session.user.email);
            } else {
                console.log("Auth Context: No active Supabase session found on initial load.");
                localStorage.removeItem('accessToken'); // Ensure token is removed if no session
            }
            // Set loading false ONLY after Supabase check is done
            setIsLoading(false);
        }).catch(err => {
            console.error("Auth Context: Error getting initial Supabase session:", err);
            setError("Failed to check authentication status.");
            setIsLoading(false); // Also set loading false on error
            localStorage.removeItem('accessToken');
        });

        // 2. Subscribe to Supabase auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("Auth Context: Supabase Auth state changed:", event, session?.user?.email);
            if (event === 'SIGNED_IN') {
                setUser(session.user);
                setIsAuthenticated(true);
                localStorage.setItem('accessToken', session.access_token); // Store token on sign in
                setError(null); // Clear previous errors on successful sign in
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setIsAuthenticated(false);
                localStorage.removeItem('accessToken'); // Remove token on sign out
            } else if (event === 'TOKEN_REFRESHED') {
                if (session?.access_token) {
                    localStorage.setItem('accessToken', session.access_token);
                    console.log("Auth Context: Supabase Token refreshed.");
                }
            }
            // If loading was true during a state change (e.g., initial sign-in), set it false
            // This handles cases where the listener fires before getSession() promise resolves
            if (isLoading) {
                setIsLoading(false);
            }
        });

        // Cleanup subscription on unmount
        return () => {
            subscription?.unsubscribe();
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    const login = useCallback(async (email, password) => {
        setIsLoading(true);
        setError(null);
        try {
            // --- Add logging here ---
            console.log(`Auth Context: Attempting login with Email: "${email}"`);
            // Avoid logging the password directly in production, but okay for local debugging:
            // console.log(`Auth Context: Attempting login with Password: "${password}"`);

            const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

            if (signInError) {
                console.error("Auth Context: Sign in error:", signInError);
                throw signInError;
            }
            console.log("Auth Context: Sign in successful for", data?.user?.email);
            // State update handled by listener

            // After successful login, merge local cart with backend cart
            await store.dispatch(mergeLocalCartWithBackend());

        } catch (err) {
            setError(err.message || 'Failed to sign in.');
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('accessToken');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { error: signOutError } = await supabase.auth.signOut();
            if (signOutError) {
                console.error("Auth Context: Sign out error:", signOutError);
                throw signOutError;
            }
            // Clear cart state and localStorage
            store.dispatch(clearLocalCartAndState());
            console.log("Auth Context: Sign out initiated.");
            // State update handled by listener
        } catch (err) {
            setError(err.message || 'Failed to sign out.');
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('accessToken');
            // Also clear cart on error, just in case
            store.dispatch(clearLocalCartAndState());
        } finally {
            setIsLoading(false);
        }
    }, []);

    const register = useCallback(async (name, email, password) => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name
                    }
                }
            });

            if (signUpError) {
                console.error("Auth Context: Sign up error:", signUpError);
                throw signUpError;
            }

            console.log("Auth Context: Sign up successful for", data?.user?.email, "Confirmation required:", data?.user?.identities?.length === 0);
            return { confirmationRequired: data?.user?.identities?.length === 0 };

        } catch (err) {
            setError(err.message || 'Failed to register.');
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('accessToken');
            return { error: err };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const contextValue = useMemo(() => ({
        user,
        isAuthenticated,
        isLoading, // Keep providing this for UI feedback during login/logout actions
        error,
        login,
        logout,
        register,
        clearError
    }), [user, isAuthenticated, isLoading, error, login, logout, register, clearError]);

    // Display loading indicator ONLY during the initial session check
    if (isLoading && !isAuthenticated && !error) {
         return (
             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                 <Spinner size="lg" />
             </div>
         );
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};