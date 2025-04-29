import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiArrowLeft, FiSave, FiImage, FiX } from 'react-icons/fi';
import {
  fetchAdminCategoryById,
  createAdminCategory,
  updateAdminCategory,
} from '../../services/adminApi';
import Spinner from '../../components/common/Spinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { supabase } from '../../services/supabaseClient';

const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  description: z.string().optional().nullable(),
});

const AdminCategoryAddEditPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(categoryId);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const {
    data: categoryData,
    isLoading: isLoadingCategory,
    error: fetchError,
  } = useQuery({
    queryKey: ['adminCategoryDetail', categoryId],
    queryFn: () => fetchAdminCategoryById(categoryId),
    enabled: isEditMode,
    select: (data) => data?.data || null,
    onSuccess: (data) => {
      if (data) {
        reset({
          name: data.name || '',
          description: data.description || '',
        });
        if (data.image_url) {
          const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
          const imageUrl = `${backendUrl}${data.image_url.startsWith('/') ? '' : '/'}${data.image_url}`;
          setExistingImageUrl(imageUrl);
          setImagePreview(imageUrl);
        } else {
          setExistingImageUrl(null);
          setImagePreview(null);
        }
        setImageFile(null);
      }
    },
    onError: (err) => {
      console.error('Error loading category:', err);
    },
  });

  // Effect to populate form in edit mode
  useEffect(() => {
    // Only run if in edit mode AND categoryData has been successfully fetched
    if (isEditMode && categoryData) {
      console.log("Category Data for Reset:", categoryData); // Debugging line
      reset({
        name: categoryData.name || '',
        description: categoryData.description || '',
      });
      // Set image preview if an image exists
      if (categoryData.image) {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
        const imageUrl = `${backendUrl}${categoryData.image.startsWith('/') ? '' : '/'}${categoryData.image}`;
        setExistingImageUrl(imageUrl);
        setImagePreview(imageUrl);
      } else {
        setExistingImageUrl(null);
        setImagePreview(null);
      }
      setNewImageFile(null);
    } else if (!isEditMode) {
      // Reset form for add mode or if data fetch fails in edit mode initially
      reset({ name: '', description: '' });
      setImagePreview(null);
      setExistingImageUrl(null);
      setNewImageFile(null);
    }
    // Ensure reset is included in dependencies if it's stable (which it should be from react-hook-form)
    // Key dependencies are isEditMode and the fetched data (categoryData)
  }, [isEditMode, categoryData, reset]);

  const categoryMutation = useMutation({
    mutationFn: async (formData) => {
      let finalImageUrl = existingImageUrl;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `category-${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('categories')
          .upload(fileName, imageFile, { cacheControl: '3600', upsert: false });

        if (uploadError) {
          console.error('Supabase Storage Upload Error:', uploadError);
          throw new Error('Image upload failed');
        }

        if (uploadData?.path) {
          finalImageUrl = `/${uploadData.path}`;
          console.log('Uploaded image relative path:', finalImageUrl);
        } else {
          console.warn('Upload successful but path not found in response.');
        }
      } else if (existingImageUrl && !imagePreview) {
        finalImageUrl = null;
      }

      const categoryPayload = {
        name: formData.name,
        description: formData.description || null,
        image_url: finalImageUrl,
      };

      console.log('Sending category payload:', categoryPayload);

      if (isEditMode) {
        return updateAdminCategory(categoryId, categoryPayload);
      } else {
        return createAdminCategory(categoryPayload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['adminCategoryDetail', categoryId] });
      navigate('/admin/categories');
    },
    onError: (err) => {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} category:`, err);
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      return () => URL.revokeObjectURL(previewUrl);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const onSubmit = (data) => {
    categoryMutation.mutate(data);
  };

  if (isLoadingCategory && isEditMode) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  const inputClass = (hasError) =>
    `block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-sm ${
      hasError ? 'border-red-500' : 'border-slate-200'
    }`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {isEditMode ? 'Edit Category' : 'Create New Category'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isEditMode ? 'Update category details' : 'Add a new product category'}
          </p>
        </div>
        <Link
          to="/admin/categories"
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <FiArrowLeft size={16} />
          Back to Categories
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 border border-slate-200">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {fetchError && <ErrorMessage message={fetchError.message || 'Failed to load category data.'} />}
          {categoryMutation.isError && (
            <ErrorMessage message={categoryMutation.error?.message || `Failed to ${isEditMode ? 'update' : 'create'} category.`} />
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              {...register('name')}
              autoFocus
              className={inputClass(errors.name)}
              placeholder="e.g., Electronics"
            />
            {errors.name && (
              <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              {...register('description')}
              className={inputClass(errors.description)}
              placeholder="Optional: Describe the category"
            />
            {errors.description && (
              <p className="text-red-600 text-xs mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category Image</label>
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-24 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <FiImage className="h-8 w-8 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <label
                  htmlFor="categoryImage"
                  className="cursor-pointer px-4 py-2 border border-slate-300 rounded-md text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {imagePreview ? 'Change Image' : 'Upload Image'}
                </label>
                <input
                  type="file"
                  id="categoryImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {imagePreview && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="ml-3 text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
                <p className="text-xs text-slate-500 mt-2">Recommended: Square image (e.g., 300x300px)</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Link
              to="/admin/categories"
              className="px-5 py-2 border border-slate-200 rounded-md text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={categoryMutation.isPending}
              className={`px-5 py-2 rounded-md text-sm text-white flex items-center gap-2 ${
                categoryMutation.isPending ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800'
              } transition-colors`}
            >
              {categoryMutation.isPending ? (
                <Spinner size="sm" />
              ) : (
                <FiSave size={16} />
              )}
              {isEditMode ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCategoryAddEditPage;