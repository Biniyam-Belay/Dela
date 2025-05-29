import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiArrowLeft, FiSave, FiImage, FiX } from 'react-icons/fi';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  const isEditMode = Boolean(categoryId);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

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

  const [currentCategory, setCurrentCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode && categoryId) {
      setLoading(true);
      fetchAdminCategoryById(categoryId)
        .then(response => {
          const categoryData = response.data; 
          setCurrentCategory(categoryData);

          if (categoryData && typeof categoryData === 'object') {
            const newValues = {
              name: categoryData.name || '',
              description: categoryData.description || '',
            };
            reset(newValues);

            if (categoryData.image_url) {
              const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
              let imageUrlPath = categoryData.image_url;
              if (imageUrlPath.startsWith('/')) {
                imageUrlPath = imageUrlPath.substring(1);
              }
              const imageUrl = `${backendUrl}/${imageUrlPath}`;
              setExistingImageUrl(imageUrl);
              setImagePreview(imageUrl);
            } else {
              setExistingImageUrl(null);
              setImagePreview(null);
            }
            setImageFile(null); 
          } else {
            reset({ name: '', description: '' });
            setExistingImageUrl(null);
            setImagePreview(null);
            setImageFile(null);
            setCurrentCategory(null); 
          }
        })
        .catch(err => {
          console.error('[EFFECT] Failed to fetch category details:', err);
          setError(err);
          reset({ name: '', description: '' }); 
          setExistingImageUrl(null);
          setImagePreview(null);
          setImageFile(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      reset({ name: '', description: '' });
      setImagePreview(null);
      setExistingImageUrl(null);
      setImageFile(null);
      setCurrentCategory(null);
      setLoading(false);
      setError(null);
    }
  }, [isEditMode, categoryId, reset]);

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
                const { error: removeError } = await supabase.storage.from('categories').remove([oldPath]);
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
        name: formData.name,
        description: formData.description || null,
        image_url: finalImageUrl,
      };

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

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);

    let imageUrlToSave = currentCategory?.image_url || null;

    if (imageFile) {
      if (currentCategory && currentCategory.image_url) {
        let oldPath = currentCategory.image_url;
        const storagePathSegment = '/categories/';
        const pathIndex = oldPath.indexOf(storagePathSegment);

        if (pathIndex !== -1) {
          oldPath = oldPath.substring(pathIndex + storagePathSegment.length);
        } else if (oldPath.startsWith('/')) {
            oldPath = oldPath.substring(1);
        }
        oldPath = oldPath.split('?')[0];


        if (oldPath && oldPath !== 'null' && oldPath.trim() !== '') {
          try {
            const { error: removeError } = await supabase.storage.from('categories').remove([oldPath]);
            if (removeError) {
              console.error('Error removing old image from Supabase:', removeError);
            }
          } catch (e) {
            console.error('Exception during old image removal from Supabase:', e);
          }
        }
      }

      const fileExt = imageFile.name.split('.').pop();
      const fileName = `category-${Date.now()}.${fileExt}`;
      try {
        const { error: uploadError } = await supabase.storage
          .from('categories')
          .upload(fileName, imageFile, {
            cacheControl: '3600',
            upsert: false, 
          });

        if (uploadError) {
          console.error('Error uploading new image to Supabase:', uploadError);
          setError(`Failed to upload image: ${uploadError.message}`);
          setLoading(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage.from('categories').getPublicUrl(fileName);
        imageUrlToSave = publicUrlData.publicUrl; 
      } catch (e) {
        console.error('Exception during new image upload to Supabase:', e);
        setError(`An unexpected error occurred during image upload: ${e.message}`);
        setLoading(false);
        return;
      }
    } else if (existingImageUrl === null && currentCategory?.image_url) {
        let oldPath = currentCategory.image_url;
        const storagePathSegment = '/categories/';
        const pathIndex = oldPath.indexOf(storagePathSegment);

        if (pathIndex !== -1) {
          oldPath = oldPath.substring(pathIndex + storagePathSegment.length);
        } else if (oldPath.startsWith('/')) {
            oldPath = oldPath.substring(1);
        }
        oldPath = oldPath.split('?')[0];

        if (oldPath && oldPath !== 'null' && oldPath.trim() !== '') {
          try {
            const { error: removeError } = await supabase.storage.from('categories').remove([oldPath]);
            if (removeError) {
              console.error('Error removing old image from Supabase (user explicitly removed):', removeError);
            }
          } catch (e) {
            console.error('Exception during old image removal from Supabase (user explicitly removed):', e);
          }
        }
        imageUrlToSave = null; 
    }


    const categoryPayload = {
      name: data.name,
      description: data.description || null,
      image_url: imageUrlToSave,
    };
    
    try {
      if (isEditMode) {
        await updateAdminCategory(categoryId, categoryPayload);
      } else {
        await createAdminCategory(categoryPayload);
      }
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      if (isEditMode && categoryId) {
        queryClient.invalidateQueries({ queryKey: ['adminCategoryDetail', categoryId] });
      }
      navigate('/admin/categories');
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} category:`, err);
      setError(err.message || `An error occurred while ${isEditMode ? 'updating' : 'creating'} the category.`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode && !currentCategory) { // Show loading only if fetching initial data
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
              disabled={categoryMutation.status === 'pending'}
              className={`px-5 py-2 rounded-md text-sm text-white flex items-center gap-2 ${
                categoryMutation.status === 'pending' ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800'
              } transition-colors`}
            >
              {categoryMutation.status === 'pending' ? (
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