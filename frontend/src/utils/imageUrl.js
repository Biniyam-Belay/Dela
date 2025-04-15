const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const placeholderImage = '/placeholder-image.jpg'; // Define a default placeholder

/**
 * Constructs the full URL for a product image.
 * Handles:
 * - Empty or null paths.
 * - Absolute URLs (starting with http).
 * - Relative paths (ensuring they start with '/').
 * - Prepends the backend URL for relative paths.
 * @param {string | null | undefined} imagePath - The image path from the product data.
 * @returns {string} The full image URL or a placeholder.
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return placeholderImage;
  }

  // If it's already a full URL, return it directly
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Ensure the relative path starts with a '/'
  const relativePath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  // Combine with backend URL
  return `${backendUrl}${relativePath}`;
};

/**
 * Gets the first available image URL from a product's image array or returns a placeholder.
 * @param {object} product - The product object, expected to have an `images` array.
 * @returns {string} The full URL of the first image or a placeholder.
 */
export const getFirstProductImageUrl = (product) => {
    const firstImage = product?.images?.[0];
    return getImageUrl(firstImage);
};

export const placeholderImageUrl = placeholderImage;
