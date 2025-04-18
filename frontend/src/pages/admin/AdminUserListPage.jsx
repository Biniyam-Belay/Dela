import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
// Explicitly import from adminApi.jsx
import { fetchAdminUsers } from '../../services/adminApi.jsx';
import Spinner from '../../components/common/Spinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import Pagination from '../../components/common/Pagination';
import { FiSearch, FiEdit2, FiUserPlus, FiAlertCircle, FiChevronDown } from 'react-icons/fi';

// Helper for role badge styling
const getRoleBadgeClass = (role) => {
    switch (role?.toLowerCase()) {
        case 'admin': return 'bg-purple-100 text-purple-800';
        case 'customer': return 'bg-green-100 text-green-800';
        default: return 'bg-slate-100 text-slate-800';
    }
};

const AdminUserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || '');
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const userRoles = ['Admin', 'Customer']; // Example roles

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchAdminUsers({
          page: currentPage,
          search: searchTerm,
          role: roleFilter,
          limit: 10, // Add limit if your API supports it
        });

        setUsers(response.data?.users || []);
        setTotalPages(response.data?.totalPages || 1);
        setTotalUsers(response.data?.totalUsers || 0);

      } catch (err) {
        // Enhanced Error Logging
        console.error("Error loading users:", err); // Log the full error object
        let errorMessage = 'Failed to load users.';
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error("Error Response Data:", err.response.data);
          console.error("Error Response Status:", err.response.status);
          console.error("Error Response Headers:", err.response.headers);
          errorMessage = `Error ${err.response.status}: ${err.response.data?.error || err.response.data?.message || 'Could not fetch users.'}`;
          if (err.response.status === 401) {
            errorMessage += " (Unauthorized - Please check login)";
          } else if (err.response.status === 403) {
             errorMessage += " (Forbidden - Insufficient permissions)";
          } else if (err.response.status === 404) {
             errorMessage += " (Endpoint not found)";
          }
        } else if (err.request) {
          // The request was made but no response was received
          console.error("Error Request:", err.request);
          errorMessage = 'No response received from server. Check network connection or backend status.';
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error Message:', err.message);
          errorMessage = `Request setup error: ${err.message}`;
        }
        setError(errorMessage);
        setUsers([]);
        setTotalPages(1);
        setTotalUsers(0);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    if (roleFilter) {
      params.set('role', roleFilter);
    } else {
      params.delete('role');
    }
    setSearchParams(params, { replace: true });
  }, [searchTerm, roleFilter]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set('page', newPage.toString());
        return newParams;
      }, { replace: true });
    }
  };

  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        if (newSearchTerm) {
            newParams.set('search', newSearchTerm);
        } else {
            newParams.delete('search');
        }
        newParams.set('page', '1');
        return newParams;
      }, { replace: true });
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setRoleFilter(newRole);
    setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        if (newRole) {
            newParams.set('role', newRole);
        } else {
            newParams.delete('role');
        }
        newParams.set('page', '1');
        return newParams;
      }, { replace: true });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
          <p className="text-slate-500 mt-1">
            {loading ? 'Loading users...' : `${totalUsers} user${totalUsers !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <Link
          to="/admin/users/new"
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 text-sm whitespace-nowrap"
        >
          <FiUserPlus size={16} />
          Add User
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow sm:max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search by Name or Email..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-sm"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="relative">
          <select
            value={roleFilter}
            onChange={handleRoleChange}
            className="appearance-none w-full sm:w-auto pl-3 pr-8 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-sm bg-white"
          >
            <option value="">All Roles</option>
            {userRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Error Message */}
      {error && <ErrorMessage message={error} />}

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12 min-h-[200px]">
            <Spinner />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center p-12 text-slate-500">
            <FiAlertCircle className="mx-auto h-10 w-10 text-slate-400 mb-4" />
            <p className="font-medium">No users found</p>
            {(searchTerm || roleFilter) && <p className="text-sm mt-1">Try adjusting your search or filters.</p>}
            {!searchTerm && !roleFilter && (
              <Link
                to="/admin/users/new"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 text-sm"
              >
                <FiUserPlus size={16} />
                Add First User
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Joined</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{user.profile?.full_name || user.email}</div>
                        <div className="text-sm text-slate-500 md:hidden mt-1">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden md:table-cell">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                          {user.role || 'Customer'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden sm:table-cell">{new Date(user.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                        <Link
                          to={`/admin/users/edit/${user.id}`}
                          className="text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center gap-1"
                          title="Edit User"
                        >
                          <FiEdit2 size={16} />
                          <span className="hidden sm:inline">Edit</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-4 sm:px-6 border-t border-slate-100">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminUserListPage;
