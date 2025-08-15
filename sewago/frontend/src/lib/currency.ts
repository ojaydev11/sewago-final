/**
 * Currency utilities for consistent Nepali Rupee (NPR) formatting
 * across the SewaGo platform
 */

export interface CurrencyOptions {
  showSymbol?: boolean;
  showDecimals?: boolean;
  locale?: string;
}

/**
 * Format a number as Nepali Rupees with consistent formatting
 * @param value - The amount in rupees
 * @param options - Formatting options
 * @returns Formatted currency string (e.g., "Rs 1,500")
 */
export const formatNPR = (value: number, options: CurrencyOptions = {}): string => {
  const {
    showSymbol = true,
    showDecimals = false,
    locale = 'en-NP'
  } = options;

  // Round to whole rupees if decimals not needed
  const roundedValue = showDecimals ? value : Math.round(value);
  
  // Format with locale-specific number formatting
  const formattedNumber = roundedValue.toLocaleString(locale, {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  return showSymbol ? `Rs ${formattedNumber}` : formattedNumber;
};

/**
 * Format a price range (e.g., "From Rs 500")
 * @param min - Minimum price
 * @param max - Maximum price (optional)
 * @param options - Formatting options
 * @returns Formatted price range string
 */
export const formatPriceRange = (
  min: number, 
  max?: number, 
  options: CurrencyOptions = {}
): string => {
  if (max && max > min) {
    return `${formatNPR(min, options)} - ${formatNPR(max, options)}`;
  }
  return `From ${formatNPR(min, options)}`;
};

/**
 * Format savings amount (e.g., "Save Rs 200")
 * @param original - Original price
 * @param discounted - Discounted price
 * @param options - Formatting options
 * @returns Formatted savings string
 */
export const formatSavings = (
  original: number, 
  discounted: number, 
  options: CurrencyOptions = {}
): string => {
  const savings = original - discounted;
  if (savings <= 0) return '';
  
  return `Save ${formatNPR(savings, options)}`;
};

/**
 * Format percentage savings
 * @param original - Original price
 * @param discounted - Discounted price
 * @returns Percentage savings string
 */
export const formatSavingsPercentage = (original: number, discounted: number): string => {
  if (original <= 0 || discounted >= original) return '';
  
  const percentage = Math.round(((original - discounted) / original) * 100);
  return `${percentage}% off`;
};

/**
 * Parse currency string back to number
 * @param currencyString - Formatted currency string (e.g., "Rs 1,500")
 * @returns Parsed number or null if invalid
 */
export const parseNPR = (currencyString: string): number | null => {
  if (!currencyString) return null;
  
  // Remove "Rs" and any other non-numeric characters except commas and dots
  const cleaned = currencyString.replace(/[^\d,.-]/g, '');
  
  // Handle Nepali number format (commas as thousand separators)
  const normalized = cleaned.replace(/,/g, '');
  
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? null : parsed;
};

/**
 * Validate if a string is a valid NPR amount
 * @param value - String to validate
 * @returns True if valid NPR amount
 */
export const isValidNPR = (value: string): boolean => {
  return parseNPR(value) !== null;
};

/**
 * Get currency symbol
 * @returns NPR currency symbol
 */
export const getNPRSymbol = (): string => 'Rs';

/**
 * Format small amounts (under Rs 100) without commas
 * @param value - Amount under Rs 100
 * @returns Formatted string
 */
export const formatSmallAmount = (value: number): string => {
  if (value >= 100) {
    return formatNPR(value);
  }
  return `Rs ${Math.round(value)}`;
};

/**
 * Format large amounts with K, L, Cr suffixes
 * @param value - Amount in rupees
 * @returns Formatted string with appropriate suffix
 */
export const formatLargeAmount = (value: number): string => {
  if (value >= 10000000) { // 1 Crore
    return `Rs ${(value / 10000000).toFixed(1)} Cr`;
  } else if (value >= 100000) { // 1 Lakh
    return `Rs ${(value / 100000).toFixed(1)} L`;
  } else if (value >= 1000) { // 1 Thousand
    return `Rs ${(value / 1000).toFixed(1)} K`;
  }
  return formatNPR(value);
};

/**
 * Default export for backward compatibility
 */
export default {
  formatNPR,
  formatPriceRange,
  formatSavings,
  formatSavingsPercentage,
  parseNPR,
  isValidNPR,
  getNPRSymbol,
  formatSmallAmount,
  formatLargeAmount
};
