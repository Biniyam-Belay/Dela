import React from 'react';
import { useAuth } from '../contexts/authContext.jsx'; // Importing the authentication context


const ProfilePage = () => {
    const { user, logout } = useAuth(); // Get user and logout function

    if (!user) {
        // This shouldn't happen if ProtectedRoute works, but good fallback
        return <p>Loading user data or not logged in.</p>;
    }

    return (
        <div className="max-w-2xl mx-auto my-10 p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
            <div className="space-y-3">
                <p><strong>Name:</strong> {user.name || 'N/A'}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            {/* Add links to order history, address management etc. later */}

            <button
                onClick={logout}
                className="mt-6 w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
            >
                Logout
            </button>
        </div>
    );
};

export default ProfilePage;