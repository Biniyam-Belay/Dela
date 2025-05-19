import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet';
import {
  createAdminProduct,
  updateAdminProduct,
} from '../../services/adminApi';
import Spinner from '../../components/common/Spinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { FiTrash2, FiSave, FiX, FiPlus, FiChevronLeft, FiUploadCloud } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../../store/categorySlice.js';
import { fetchProductById } from '../../store/productSlice.js';

const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number({ invalid_type_error: 'Price must be a number' }).positive('Price must be positive'),
  stockQuantity: z.coerce.number({ invalid_type_error: 'Stock must be a number' }).int().nonnegative('Stock cannot be negative'),
  categoryId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  originalPrice: z.coerce.number({ invalid_type_error: 'Original price must be a number' }).positive('Original price must be positive').optional().nullable(),
  rating: z.coerce.number().min(0).max(5).optional().nullable(),
  reviewCount: z.coerce.number().int().nonnegative().optional().nullable(),
  sellerName: z.string().optional().nullable(),
  sellerLocation: z.string().optional().nullable(),
  unitsSold: z.coerce.number().int().nonnegative().optional().nullable(),
});

const AdminProductAddEditPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(productId);

  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { currentProduct: productData, loading: productLoading } = useSelector((state) => state.products);
  const { items: categoriesData = [], loading: categoriesLoading } = useSelector((state) => state.categories);

  const [formError, setFormError] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      stockQuantity: 0,
      categoryId: '',
      isActive: true,
      originalPrice: '',
      rating: '',
      reviewCount: '',
      sellerName: '',
      sellerLocation: '',
      unitsSold: 0,
    },
  });

  const isActiveValue = watch('isActive');

  useEffect(() => {
    dispatch(fetchCategories());
    if (isEditMode) {
      dispatch(fetchProductById(productId));
    }
  }, [dispatch, isEditMode, productId]);

  useEffect(() => {
    if (isEditMode && productData && productData.data) {
      const p = productData.data;
      reset({
        name: p.name || '',
        description: p.description || '',
        price: p.price ?? '',
        stockQuantity: p.stock_quantity ?? p.stockQuantity ?? 0,
        categoryId: p.category_id || '',
        isActive: p.is_active !== undefined ? p.is_active : true,
        rating: p.rating ?? '',
        reviewCount: p.review_count ?? '',
        originalPrice: p.original_price ?? '',
        sellerName: p.seller_name || '',
        sellerLocation: p.seller_location || '',
        unitsSold: p.units_sold ?? 0,
      });
      const currentImages = p.images || [];
      setExistingImages(currentImages);
      setImagePreviews(currentImages.map(img =>
        typeof img === 'string' ? img : `${backendUrl}${img.image_url?.startsWith('/') ? '' : '/'}${img.image_url}`
      ));
      setNewImageFiles([]);
    } else if (!isEditMode) {
      reset({
        name: '',
        description: '',
        price: '',
        stockQuantity: 0,
        categoryId: '',
        isActive: true,
        rating: '',
        reviewCount: '',
        originalPrice: '',
        sellerName: '',
        sellerLocation: '',
        unitsSold: 0,
      });
      setExistingImages([]);
      setImagePreviews([]);
      setNewImageFiles([]);
    }
  }, [isEditMode, productData, reset, backendUrl]);

  const handleImageChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => file.type.startsWith('image/'));

      setNewImageFiles(prev => [...prev, ...validFiles]);

      const newPreviews = validFiles.map(file => ({
        url: URL.createObjectURL(file),
        isNew: true,
        file: file,
      }));
      setImagePreviews(prev => [...prev, ...newPreviews]);

      e.target.value = '';
    }
  };

  const removeImage = (indexToRemove) => {
    const previewToRemove = imagePreviews[indexToRemove];

    if (previewToRemove.isNew) {
      URL.revokeObjectURL(previewToRemove.url);
      setNewImageFiles(prev => prev.filter(file => file !== previewToRemove.file));
    }

    setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const onSubmit = async (data) => {
    setFormError(null);
    const formData = new FormData();

    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', data.price);
    formData.append('stockQuantity', data.stockQuantity);
    if (data.categoryId) formData.append('categoryId', data.categoryId);
    formData.append('isActive', data.isActive);

    if (data.originalPrice) formData.append('originalPrice', data.originalPrice);
    if (data.rating) formData.append('rating', data.rating);
    if (data.reviewCount) formData.append('reviewCount', data.reviewCount);
    if (data.sellerName) formData.append('sellerName', data.sellerName);
    if (data.sellerLocation) formData.append('sellerLocation', data.sellerLocation);
    if (data.unitsSold) formData.append('unitsSold', data.unitsSold);

    if (isEditMode) {
      const currentPreviewUrls = imagePreviews.map(p => p.url);
      const imagesToDelete = existingImages.filter(imgUrl =>
        !currentPreviewUrls.includes(`${backendUrl}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`)
      );
      const keptExistingImageUrls = existingImages.filter(imgUrl =>
        currentPreviewUrls.includes(`${backendUrl}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`)
      );

      if (imagesToDelete.length > 0) {
        formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
      }
      formData.append('existingImages', JSON.stringify(keptExistingImageUrls));
    }

    newImageFiles.forEach((file) => {
      formData.append('newImages', file);
    });

    try {
      if (isEditMode) {
        await updateAdminProduct(productId, formData);
        toast.success('Product updated successfully!');
      } else {
        await createAdminProduct(formData);
        toast.success('Product created successfully!');
      }
      queryClient.invalidateQueries(['admin-products']);
      navigate('/admin/products');
    } catch (err) {
      const apiError = err?.message || `Failed to ${isEditMode ? 'update' : 'create'} product.`;
      setFormError(apiError);
      toast.error(apiError);
      console.error("Submit error:", err.response?.data || err);
    }
  };

  if (categoriesLoading || productLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  if (isEditMode && (productLoading || !productData)) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  const inputClass = (hasError) =>
    `block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-sm ${
      hasError ? 'border-red-500' : 'border-slate-200'
    }`;
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Admin Add/Edit Product | SuriAddis</title>
        <meta name="description" content="Admin: Add or edit a product in the SuriAddis store." />
      </Helmet>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {isEditMode ? 'Edit Product' : 'Create New Product'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isEditMode ? 'Update product details' : 'Add a new product to your store'}
          </p>
        </div>
        <Link
          to="/admin/products"
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <FiChevronLeft size={16} />
          Back to Products
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 border border-slate-200 space-y-8">
          {formError && <ErrorMessage message={formError} />}

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="md:col-span-2">
                <label htmlFor="name" className={labelClass}>
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  {...register('name')}
                  className={inputClass(errors.name)}
                  placeholder="e.g., Premium Leather Wallet"
                />
                {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label htmlFor="description" className={labelClass}>
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  rows={4}
                  {...register('description')}
                  className={inputClass(errors.description)}
                  placeholder="Describe the product..."
                />
                {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description.message}</p>}
              </div>
              <div>
                <label htmlFor="categoryId" className={labelClass}>
                  Category
                </label>
                <select
                  id="categoryId"
                  {...register('categoryId')}
                  className={inputClass(errors.categoryId)}
                >
                  <option value="">Select a category</option>
                  {categoriesData.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-red-600 text-xs mt-1">{errors.categoryId.message}</p>}
              </div>
              <div className="flex items-end pb-1">
                <label htmlFor="isActive" className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="isActive"
                    {...register('isActive')}
                    className="h-4 w-4 border-slate-300 rounded text-slate-600 focus:ring-slate-500"
                  />
                  <span className="ml-2 text-sm text-slate-700">Product is Active</span>
                </label>
              </div>
              <div className="md:col-span-2 text-xs text-slate-500">
                Status: {isActiveValue ? <span className="font-medium text-emerald-600">Active</span> : <span className="font-medium text-amber-600">Inactive</span>}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Pricing & Inventory
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
              <div>
                <label htmlFor="price" className={labelClass}>
                  Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="price"
                  {...register('price')}
                  className={inputClass(errors.price)}
                  placeholder="0.00"
                />
                {errors.price && <p className="text-red-600 text-xs mt-1">{errors.price.message}</p>}
              </div>
              <div>
                <label htmlFor="originalPrice" className={labelClass}>
                  Original Price (Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="originalPrice"
                  {...register('originalPrice')}
                  className={inputClass(errors.originalPrice)}
                  placeholder="e.g., 99.99 (for sales)"
                />
                {errors.originalPrice && <p className="text-red-600 text-xs mt-1">{errors.originalPrice.message}</p>}
              </div>
              <div>
                <label htmlFor="stockQuantity" className={labelClass}>
                  Stock Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="1"
                  id="stockQuantity"
                  {...register('stockQuantity')}
                  className={inputClass(errors.stockQuantity)}
                  placeholder="0"
                />
                {errors.stockQuantity && <p className="text-red-600 text-xs mt-1">{errors.stockQuantity.message}</p>}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Optional Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
              <div>
                <label htmlFor="rating" className={labelClass}>
                  Rating (0-5)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0" max="5"
                  id="rating"
                  {...register('rating')}
                  className={inputClass(errors.rating)}
                  placeholder="e.g., 4.5"
                />
                {errors.rating && <p className="text-red-600 text-xs mt-1">{errors.rating.message}</p>}
              </div>
              <div>
                <label htmlFor="reviewCount" className={labelClass}>
                  Review Count
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  id="reviewCount"
                  {...register('reviewCount')}
                  className={inputClass(errors.reviewCount)}
                  placeholder="0"
                />
                {errors.reviewCount && <p className="text-red-600 text-xs mt-1">{errors.reviewCount.message}</p>}
              </div>
              <div>
                <label htmlFor="unitsSold" className={labelClass}>
                  Units Sold
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  id="unitsSold"
                  {...register('unitsSold')}
                  className={inputClass(errors.unitsSold)}
                  placeholder="0"
                />
                {errors.unitsSold && <p className="text-red-600 text-xs mt-1">{errors.unitsSold.message}</p>}
              </div>
              <div className="sm:col-span-1">
                <label htmlFor="sellerName" className={labelClass}>
                  Seller Name
                </label>
                <input
                  type="text"
                  id="sellerName"
                  {...register('sellerName')}
                  className={inputClass(errors.sellerName)}
                  placeholder="e.g., SuriAddis Official"
                />
                {errors.sellerName && <p className="text-red-600 text-xs mt-1">{errors.sellerName.message}</p>}
              </div>
              <div className="sm:col-span-1">
                <label htmlFor="sellerLocation" className={labelClass}>
                  Seller Location
                </label>
                <input
                  type="text"
                  id="sellerLocation"
                  {...register('sellerLocation')}
                  className={inputClass(errors.sellerLocation)}
                  placeholder="e.g., Addis Ababa"
                />
                {errors.sellerLocation && <p className="text-red-600 text-xs mt-1">{errors.sellerLocation.message}</p>}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Product Images
            </h2>
            {imagePreviews.length > 0 && (
              <div className="mb-4">
                <label className={labelClass}>Image Previews</label>
                <div className="flex flex-wrap gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group w-20 h-20 sm:w-24 sm:h-24">
                      <img
                        src={preview.url}
                        alt={`Preview ${index + 1}`}
                        className="h-full w-full object-cover rounded-lg border border-slate-200"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://exutmsxktrnltvdgnlop.supabase.co/storage/v1/object/public/public_assets/placeholder.webp'; }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                        aria-label="Remove image"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="productImages" className={labelClass}>
                {imagePreviews.length > 0 ? 'Add More Images' : 'Upload Images'}
              </label>
              <label
                htmlFor="productImages"
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer hover:border-slate-400 transition-colors"
              >
                <div className="space-y-1 text-center">
                  <FiUploadCloud className="mx-auto h-10 w-10 text-slate-400" />
                  <div className="flex text-sm text-slate-600">
                    <span className="relative font-medium text-slate-700 hover:text-slate-900 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-slate-500">
                      Click to upload
                    </span>
                    <input id="productImages" name="productImages" type="file" multiple accept="image/*" className="sr-only" onChange={handleImageChange} />
                  </div>
                  <p className="text-xs text-slate-500">PNG, JPG, GIF, WEBP up to 5MB</p>
                </div>
              </label>
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Link
              to="/admin/products"
              className="px-5 py-2 border border-slate-200 rounded-md text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 rounded-md text-sm text-white flex items-center gap-2 ${
                isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800'
              } transition-colors`}
            >
              {isSubmitting ? (
                <Spinner size="sm" />
              ) : (
                <FiSave size={16} />
              )}
              {isEditMode ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminProductAddEditPage;