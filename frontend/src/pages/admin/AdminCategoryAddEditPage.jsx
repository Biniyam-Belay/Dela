import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiArrowLeft, FiSave, FiImage, FiX } from 'react-icons/fi';
import { Helmet } from 'react-helmet';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCategoryById, createCategory, updateCategory } from '../../store/categorySlice';
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

  const dispatch = useDispatch();
  const { currentCategory, loading, error, mutationStatus, mutationError } = useSelector((state) => state.categories);

  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchCategoryById(categoryId));
    }
  }, [dispatch, isEditMode, categoryId]);

  useEffect(() => {
    if (isEditMode && currentCategory) {
      reset({
        name: currentCategory.name || '',
        description: currentCategory.description || '',
      });
      if (currentCategory.image_url) {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
        const imageUrl = `${backendUrl}${currentCategory.image_url.startsWith('/') ? '' : '/'}${currentCategory.image_url}`;
        setExistingImageUrl(imageUrl);
        setImagePreview(imageUrl);
      } else {
        setExistingImageUrl(null);
        setImagePreview(null);
      }
      setImageFile(null);
    } else if (!isEditMode) {
      reset({ name: '', description: '' });
      setImagePreview(null);
      setExistingImageUrl(null);
      setImageFile(null);
    }
  }, [isEditMode, currentCategory, reset]);

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

  const onSubmit = async (data) => {
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
        finalImageUrl = `/categories/${fileName}`;

        if (isEditMode && existingImageUrl) {
          const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
          let oldPath = existingImageUrl.replace(backendUrl, '');
          if (oldPath.startsWith('/')) oldPath = oldPath.substring(1);
          if (!oldPath.startsWith('categories/')) {
            oldPath = `categories/${oldPath}`;
          }
          oldPath = oldPath.split('?')[0];
          if (oldPath && oldPath !== `categories/${fileName}`) {
            try {
              const { data: removeData, error: removeError } = await supabase.storage.from('categories').remove([oldPath]);
              if (removeError) {
                console.error('Failed to delete old category image:', removeError);
              }
            } catch (e) {
              console.error('Exception while deleting old category image:', e);
            }
          }
        }
      }
    } else if (existingImageUrl && !imagePreview) {
      finalImageUrl = null;
    }

    const categoryPayload = {
      name: data.name,
      description: data.description || null,
      image_url: finalImageUrl,
    };

    if (isEditMode) {
      await dispatch(updateCategory({ categoryId, categoryData: categoryPayload }));
    } else {
      await dispatch(createCategory(categoryPayload));
    }

    if (!mutationError) {
      navigate('/admin/categories');
    }
  };

  if (loading && isEditMode) {
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
      <Helmet>
        <title>Admin Add/Edit Category | SuriAddis</title>
        <meta name="description" content="Admin: Add or edit a product category in the SuriAddis store." />
      </Helmet>
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
          {error && <ErrorMessage message={error.message || 'Failed to load category data.'} />}
          {mutationError && (
            <ErrorMessage message={mutationError.message || `Failed to ${isEditMode ? 'update' : 'create'} category.`} />
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
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={e => { e.target.onerror = null; e.target.src = '/placeholder-image.jpg'; }}
                  />
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
              disabled={mutationStatus === 'pending'}
              className={`px-5 py-2 rounded-md text-sm text-white flex items-center gap-2 ${
                mutationStatus === 'pending' ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800'
              } transition-colors`}
            >
              {mutationStatus === 'pending' ? (
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