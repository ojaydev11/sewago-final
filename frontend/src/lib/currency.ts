/**
 * Currency utilities for SewaGo platform
 * Focused on Nepali Rupees (NPR) with international support
 */

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  decimalPlaces: number;
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  NPR: {
    code: 'NPR',
    symbol: 'रू',
    name: 'Nepali Rupee',
    locale: 'ne-NP',
    decimalPlaces: 2
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    decimalPlaces: 2
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    locale: 'en-IN',
    decimalPlaces: 2
  }
};

/**
 * Format amount in Nepali Rupees (NPR)
 * @param amount - Amount in paisa (smallest unit) or rupees
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatNPR(
  amount: number,
  options: {
    showSymbol?: boolean;
    showCode?: boolean;
    compact?: boolean;
    locale?: string;
  } = {}
): string {
  const {
    showSymbol = true,
    showCode = false,
    compact = false,
    locale = 'ne-NP'
  } = options;

  // Convert to rupees if amount seems to be in paisa
  const rupees = amount >= 1000 ? amount : amount / 100;
  
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'NPR',
    currencyDisplay: showSymbol ? 'symbol' : 'code',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    notation: compact ? 'compact' : 'standard',
    compactDisplay: 'short'
  });

  let formatted = formatter.format(rupees);
  
  // Add currency code if requested
  if (showCode && !formatted.includes('NPR')) {
    formatted += ' NPR';
  }

  return formatted;
}

/**
 * Format amount in any supported currency
 * @param amount - Amount in smallest unit
 * @param currencyCode - Currency code (NPR, USD, INR)
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = 'NPR',
  options: {
    showSymbol?: boolean;
    showCode?: boolean;
    compact?: boolean;
    locale?: string;
  } = {}
): string {
  const currency = CURRENCIES[currencyCode.toUpperCase()];
  if (!currency) {
    throw new Error(`Unsupported currency: ${currencyCode}`);
  }

  const {
    showSymbol = true,
    showCode = false,
    compact = false,
    locale = currency.locale
  } = options;

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.code,
    currencyDisplay: showSymbol ? 'symbol' : 'code',
    minimumFractionDigits: 0,
    maximumFractionDigits: currency.decimalPlaces,
    notation: compact ? 'compact' : 'standard',
    compactDisplay: 'short'
  });

  let formatted = formatter.format(amount);
  
  if (showCode && !formatted.includes(currency.code)) {
    formatted += ` ${currency.code}`;
  }

  return formatted;
}

/**
 * Parse currency string back to number
 * @param currencyString - Formatted currency string
 * @returns Amount in smallest unit
 */
export function parseCurrency(currencyString: string): number {
  // Remove all non-numeric characters except decimal point
  const numericString = currencyString.replace(/[^\d.]/g, '');
  const amount = parseFloat(numericString);
  
  if (isNaN(amount)) {
    throw new Error(`Invalid currency string: ${currencyString}`);
  }
  
  return amount;
}

/**
 * Convert between currencies using exchange rates
 * @param amount - Amount to convert
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @param exchangeRates - Exchange rates object
 * @returns Converted amount
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRates: Record<string, number>
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const fromRate = exchangeRates[fromCurrency];
  const toRate = exchangeRates[toCurrency];

  if (!fromRate || !toRate) {
    throw new Error(`Missing exchange rate for ${fromCurrency} or ${toCurrency}`);
  }

  // Convert to base currency (USD) then to target
  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
}

/**
 * Get currency symbol by code
 * @param currencyCode - Currency code
 * @returns Currency symbol
 */
export function getCurrencySymbol(currencyCode: string): string {
  const currency = CURRENCIES[currencyCode.toUpperCase()];
  return currency?.symbol || currencyCode;
}

/**
 * Get currency name by code
 * @param currencyCode - Currency code
 * @returns Currency name
 */
export function getCurrencyName(currencyCode: string): string {
  const currency = CURRENCIES[currencyCode.toUpperCase()];
  return currency?.name || currencyCode;
}

/**
 * Check if currency code is supported
 * @param currencyCode - Currency code to check
 * @returns True if supported
 */
export function isSupportedCurrency(currencyCode: string): boolean {
  return currencyCode.toUpperCase() in CURRENCIES;
}

/**
 * Get all supported currency codes
 * @returns Array of supported currency codes
 */
export function getSupportedCurrencies(): string[] {
  return Object.keys(CURRENCIES);
}

/**
 * Format price range (e.g., "रू 500 - रू 1,000")
 * @param minAmount - Minimum amount
 * @param maxAmount - Maximum amount
 * @param currencyCode - Currency code
 * @returns Formatted price range
 */
export function formatPriceRange(
  minAmount: number,
  maxAmount: number,
  currencyCode: string = 'NPR'
): string {
  const min = formatCurrency(minAmount, currencyCode, { showCode: false });
  const max = formatCurrency(maxAmount, currencyCode, { showCode: false });
  return `${min} - ${max}`;
}

/**
 * Format percentage discount
 * @param originalPrice - Original price
 * @param discountedPrice - Discounted price
 * @returns Formatted discount percentage
 */
export function formatDiscount(
  originalPrice: number,
  discountedPrice: number
): string {
  const discount = ((originalPrice - discountedPrice) / originalPrice) * 100;
  return `${Math.round(discount)}% OFF`;
}

/**
 * Format savings amount
 * @param originalPrice - Original price
 * @param discountedPrice - Discounted price
 * @param currencyCode - Currency code
 * @returns Formatted savings
 */
export function formatSavings(
  originalPrice: number,
  discountedPrice: number,
  currencyCode: string = 'NPR'
): string {
  const savings = originalPrice - discountedPrice;
  return `Save ${formatCurrency(savings, currencyCode, { showCode: false })}`;
}
