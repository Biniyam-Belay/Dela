import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; // Import Redux hooks
import { fetchUsers } from '../../store/userSlice'; // Assuming fetchUsers will be in userSlice.js

import Spinner from '../../components/common/Spinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import Pagination from '../../components/common/Pagination';
import { FiSearch, FiEdit2, FiUserPlus, FiAlertCircle, FiChevronDown } from 'react-icons/fi';

const getRoleBadgeClass = (role) => {
    switch (role?.toLowerCase()) {
        case 'admin': return 'bg-purple-100 text-purple-800';
        case 'customer': return 'bg-green-100 text-green-800';
        default: return 'bg-slate-100 text-slate-800';
    }
};

const AdminUserListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || '');
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const userRoles = ['Admin', 'Customer'];

  const dispatch = useDispatch();
  const userSliceState = useSelector((state) => state.users);
  const { 
    items: users = [], 
    loading = false, 
    error = null, 
    totalPages = 1, 
    totalUsers = 0 
  } = userSliceState || { 
    items: [], 
    loading: false, 
    error: null, 
    totalPages: 1, 
    totalUsers: 0 
  };

  const [deleteError, setDeleteError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    dispatch(fetchUsers({
      page: currentPage,
      limit: 10,
      search: searchTerm || undefined,
      role: roleFilter || undefined,
    }));
  }, [dispatch, currentPage, searchTerm, roleFilter]);

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
      {error && <ErrorMessage message={error.message || error} />}
      {deleteError && <ErrorMessage message={deleteError} />}

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {loading && users.length === 0 ? (
          <div className="flex justify-center items-center p-12 min-h-[200px]">
            <Spinner />
          </div>
        ) : !loading && users.length === 0 && !error ? (
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
                        <div className="text-sm font-medium text-slate-900">{user.name || user.email}</div>
                        <div className="text-sm text-slate-500 md:hidden mt-1">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden md:table-cell">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                          {user.role || 'Customer'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden sm:table-cell">{new Date(user.createdAt).toLocaleDateString()}</td>
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
