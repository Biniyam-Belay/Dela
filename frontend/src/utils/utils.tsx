import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as a currency string (e.g., $1,234.56).
 * Defaults to USD, but can be customized.
 * @param amount The number to format.
 * @param currency The currency code (e.g., 'USD', 'EUR'). Defaults to 'USD'.
 * @param locale The locale string (e.g., 'en-US', 'de-DE'). Defaults to 'en-US'.
 * @returns The formatted currency string.
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  // Handle potential non-numeric input gracefully
  if (typeof amount !== 'number' || isNaN(amount)) {
    console.warn('formatCurrency received a non-numeric value:', amount);
    return ''; // Or return a default like '$0.00' or 'N/A'
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      // You might want to adjust minimumFractionDigits if needed
      // minimumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    // Fallback for safety
    return `${currency} ${amount.toFixed(2)}`;
  }
};

/**
 * Formats a number as Ethiopian Birr currency string (e.g., ETB 1,234.56).
 * @param amount The number to format.
 * @returns The formatted Ethiopian Birr currency string.
 */
export const formatETB = (amount: number): string => formatCurrency(amount, 'ETB', 'en-ET');
