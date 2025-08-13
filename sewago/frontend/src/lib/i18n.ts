// Internationalization for SewaGo
// Supports English (en) and Nepali (ne)

export type Locale = 'en' | 'ne';

// i18n Configuration
export const i18nConfig = {
  locales: ['en', 'ne'] as Locale[],
  defaultLocale: 'en' as Locale,
  localeNames: {
    en: 'English',
    ne: 'नेपाली'
  }
};

// Translation dictionaries
const TRANSLATIONS: Record<Locale, Record<string, string>> = {
  en: {
    // Common actions
    'book': 'Book',
    'cancel': 'Cancel',
    'reschedule': 'Reschedule',
    'pay': 'Pay',
    'search': 'Search',
    'help': 'Help',
    
    // Services
    'electrician': 'Electrician',
    'plumber': 'Plumber',
    'cleaner': 'Cleaner',
    'gardener': 'Gardener',
    'technician': 'Technician',
    'house_cleaning': 'House Cleaning',
    'electrical_work': 'Electrical Work',
    'plumbing': 'Plumbing',
    'gardening': 'Gardening',
    
    // Cities/Districts
    'kathmandu': 'Kathmandu',
    'lalitpur': 'Lalitpur',
    'bhaktapur': 'Bhaktapur',
    'kirtipur': 'Kirtipur',
    
    // Time
    'today': 'Today',
    'tomorrow': 'Tomorrow',
    'morning': 'Morning',
    'afternoon': 'Afternoon',
    'evening': 'Evening',
    'night': 'Night',
    
    // Status
    'requested': 'Requested',
    'accepted': 'Accepted',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    
    // Payment
    'cod': 'Cash on Delivery',
    'esewa': 'eSewa',
    'pending': 'Pending',
    'paid': 'Paid',
    'refunded': 'Refunded',
    
    // Messages
    'booking_confirmed': 'Booking confirmed',
    'service_scheduled': 'Service scheduled',
    'payment_required': 'Payment required',
    'cancellation_successful': 'Cancellation successful',
    'refund_processed': 'Refund processed',
    
    // AI Responses
    'ai_booking_success': 'Booked: {service} for {date} at {time} in {district}',
    'ai_quote_response': 'Estimated cost: Rs. {amount} for {service} in {district}',
    'ai_availability_response': 'Available slots: {slots}',
    'ai_cancellation_success': 'Booking {bookingId} cancelled successfully',
    'ai_no_info': "I don't have this information yet",
    'ai_ask_missing': 'Please provide: {fields}',
    'ai_escalate': 'I\'ll connect you with human support',
    
    // Errors
    'error_service_not_found': 'Service not found',
    'error_user_not_found': 'User not found',
    'error_booking_not_found': 'Booking not found',
    'error_invalid_input': 'Invalid input provided',
    'error_database_error': 'Database error occurred',
    
    // Sources
    'source_services_db': 'Services Database',
    'source_policy': 'Policy',
    'source_faq': 'FAQ',
    'source_user_data': 'User Data',
    'source_booking_data': 'Booking Data'
  },
  
  ne: {
    // Common actions
    'book': 'बुक गर्नुहोस्',
    'cancel': 'रद्द गर्नुहोस्',
    'reschedule': 'पुनर्निर्धारण गर्नुहोस्',
    'pay': 'भुक्तानी गर्नुहोस्',
    'search': 'खोज्नुहोस्',
    'help': 'सहयोग',
    
    // Services
    'electrician': 'बिजुली मिस्त्री',
    'plumber': 'प्लम्बर',
    'cleaner': 'सफाई कर्मचारी',
    'gardener': 'बगैंचा माली',
    'technician': 'टेक्निसियन',
    'house_cleaning': 'घर सफाई',
    'electrical_work': 'बिजुली काम',
    'plumbing': 'प्लम्बिङ',
    'gardening': 'बगैंचा काम',
    
    // Cities/Districts
    'kathmandu': 'काठमाडौं',
    'lalitpur': 'ललितपुर',
    'bhaktapur': 'भक्तपुर',
    'kirtipur': 'किर्तिपुर',
    
    // Time
    'today': 'आज',
    'tomorrow': 'भोलि',
    'morning': 'बिहान',
    'afternoon': 'दिउँसो',
    'evening': 'साँझ',
    'night': 'रात',
    
    // Status
    'requested': 'अनुरोध गरियो',
    'accepted': 'स्वीकार गरियो',
    'in_progress': 'प्रगतिमा',
    'completed': 'पूरा भयो',
    'cancelled': 'रद्द गरियो',
    
    // Payment
    'cod': 'क्यास अन डिलिभरी',
    'esewa': 'ईसेवा',
    'pending': 'प्रक्रियामा',
    'paid': 'भुक्तानी गरियो',
    'refunded': 'फिर्ता गरियो',
    
    // Messages
    'booking_confirmed': 'बुकिङ पुष्टि गरियो',
    'service_scheduled': 'सेवा तोकिएको',
    'payment_required': 'भुक्तानी आवश्यक',
    'cancellation_successful': 'रद्दीकरण सफल',
    'refund_processed': 'फिर्ता प्रक्रिया गरियो',
    
    // AI Responses
    'ai_booking_success': 'बुक गरियो: {service} {date} मा {time} बजे {district} मा',
    'ai_quote_response': 'अनुमानित लागत: रु. {amount} {service} को लागि {district} मा',
    'ai_availability_response': 'उपलब्ध समय: {slots}',
    'ai_cancellation_success': 'बुकिङ {bookingId} सफलतापूर्वक रद्द गरिएको',
    'ai_no_info': 'मलाई यो जानकारी अहिले छैन',
    'ai_ask_missing': 'कृपया प्रदान गर्नुहोस्: {fields}',
    'ai_escalate': 'म तपाईंलाई मानव सहयोगसँग जडान गर्नेछु',
    
    // Errors
    'error_service_not_found': 'सेवा फेला परेन',
    'error_user_not_found': 'प्रयोगकर्ता फेला परेन',
    'error_booking_not_found': 'बुकिङ फेला परेन',
    'error_invalid_input': 'अमान्य इनपुट प्रदान गरिएको',
    'error_database_error': 'डाटाबेस त्रुटि भयो',
    
    // Sources
    'source_services_db': 'सेवा डाटाबेस',
    'source_policy': 'नीति',
    'source_faq': 'बारम्बार सोधिने प्रश्न',
    'source_user_data': 'प्रयोगकर्ता डाटा',
    'source_booking_data': 'बुकिङ डाटा'
  }
};

// Main translation function
export function t(key: string, locale: Locale = 'en'): string {
  const translations = TRANSLATIONS[locale];
  if (!translations) {
    console.warn(`Locale ${locale} not found, falling back to English`);
    return TRANSLATIONS.en[key] || key;
  }
  
  return translations[key] || key;
}

// Translation with interpolation
export function tInterpolate(
  key: string, 
  params: Record<string, string | number>, 
  locale: Locale = 'en'
): string {
  let translation = t(key, locale);
  
  // Replace placeholders with actual values
  Object.entries(params).forEach(([param, value]) => {
    translation = translation.replace(new RegExp(`{${param}}`, 'g'), String(value));
  });
  
  return translation;
}

// Get available locales
export function getAvailableLocales(): Locale[] {
  return Object.keys(TRANSLATIONS) as Locale[];
}

// Validate locale
export function isValidLocale(locale: string): locale is Locale {
  return getAvailableLocales().includes(locale as Locale);
}

// Get locale from Accept-Language header
export function getLocaleFromHeader(acceptLanguage: string): Locale {
  const languages = acceptLanguage
    .split(',')
    .map(lang => lang.split(';')[0].trim().toLowerCase());
  
  // Check for Nepali first
  if (languages.some(lang => lang.startsWith('ne'))) {
    return 'ne';
  }
  
  // Default to English
  return 'en';
}

// Get locale from cookie
export function getLocaleFromCookie(): Locale {
  if (typeof document === 'undefined') return 'en';
  
  const cookies = document.cookie.split(';');
  const localeCookie = cookies.find(cookie => cookie.trim().startsWith('locale='));
  
  if (localeCookie) {
    const locale = localeCookie.split('=')[1];
    if (isValidLocale(locale)) {
      return locale;
    }
  }
  
  return 'en';
}

// Set locale cookie
export function setLocaleCookie(locale: Locale): void {
  if (typeof document === 'undefined') return;
  
  document.cookie = `locale=${locale}; path=/; max-age=31536000`; // 1 year
}

// Format currency based on locale
export function formatCurrency(amount: number, locale: Locale = 'en'): string {
  if (locale === 'ne') {
    return `रु. ${amount.toLocaleString('ne-NP')}`;
  }
  
  return `Rs. ${amount.toLocaleString('en-IN')}`;
}

// Format date based on locale
export function formatDate(date: Date, locale: Locale = 'en'): string {
  if (locale === 'ne') {
    // Nepali date formatting
    return date.toLocaleDateString('ne-NP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
