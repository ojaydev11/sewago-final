/**
 * Currency formatting utilities for NPR (Nepalese Rupees)
 */

/**
 * Formats a number as NPR currency with the "Rs" symbol and whole numbers
 * @param amount - The amount to format
 * @returns Formatted string like "Rs 1,234"
 */
export function formatNPR(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 'Rs 0';
  }
  
  // Round to whole number and format with locale
  const roundedAmount = Math.round(amount);
  return `Rs ${roundedAmount.toLocaleString('en-NP')}`;
}

/**
 * Formats a price range as NPR currency
 * @param min - Minimum price
 * @param max - Maximum price
 * @returns Formatted string like "Rs 500 - Rs 1,500"
 */
export function formatNPRRange(min: number, max: number): string {
  return `${formatNPR(min)} - ${formatNPR(max)}`;
}

/**
 * Formats a percentage discount
 * @param originalPrice - Original price
 * @param discountedPrice - Discounted price
 * @returns Formatted string like "Save Rs 500 (25%)"
 */
export function formatNPRDiscount(originalPrice: number, discountedPrice: number): string {
  const savings = originalPrice - discountedPrice;
  const percentage = Math.round((savings / originalPrice) * 100);
  return `Save ${formatNPR(savings)} (${percentage}%)`;
}
