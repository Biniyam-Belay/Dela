import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import {
  fetchAdminCategoryById,
  createAdminCategory,
  updateAdminCategory,
} from '../../services/adminApi';
import Spinner from '../../components/common/Spinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  description: z.string().optional().nullable(),
});

const AdminCategoryAddEditPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(categoryId);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (isEditMode && categoryId) {
      setLoading(true);
      setError(null);
      fetchAdminCategoryById(categoryId)
        .then((response) => {
          reset({
            name: response.data.name,
            description: response.data.description || '',
          });
        })
        .catch((err) => {
          setError(err.error || err.message || 'Failed to load category data.');
          console.error('Error fetching category:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [isEditMode, categoryId, reset]);

  const onSubmit = async (data) => {
    setError(null);
    const categoryData = {
      name: data.name,
      description: data.description || null,
    };

    try {
      if (isEditMode) {
        await updateAdminCategory(categoryId, categoryData);
      } else {
        await createAdminCategory(categoryData);
      }
      navigate('/admin/categories');
    } catch (err) {
      setError(err.error || err.message || `Failed to ${isEditMode ? 'update' : 'create'} category.`);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light text-gray-900">
              {isEditMode ? 'Edit Category' : 'Create New Category'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isEditMode ? 'Update your category details' : 'Add a new product category'}
            </p>
          </div>
          <Link
            to="/admin/categories"
            className="flex items-center text-gray-600 hover:text-black"
          >
            <FiArrowLeft className="mr-2" />
            Back to Categories
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && <ErrorMessage message={error} className="mb-6" />}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Category Name *
          </label>
          <input
            type="text"
            id="name"
            {...register('name')}
            autoFocus
            className={`block w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black focus:border-black ${
              errors.name ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {errors.name && (
            <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            {...register('description')}
            className={`block w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black focus:border-black ${
              errors.description ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {errors.description && (
            <p className="text-red-600 text-xs mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Link
            to="/admin/categories"
            className="px-6 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 rounded-lg text-white flex items-center gap-2 ${
              isSubmitting ? 'bg-gray-400' : 'bg-black hover:bg-gray-800'
            } transition-colors`}
          >
            {isSubmitting ? (
              <Spinner size="sm" />
            ) : (
              <>
                <FiSave size={16} />
                {isEditMode ? 'Update Category' : 'Create Category'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCategoryAddEditPage;