// E2E Test Configuration
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4100';

export const TEST_CONFIG = {
  // Timeouts
  DEFAULT_TIMEOUT: 30000,
  PAGE_LOAD_TIMEOUT: 10000,
  ELEMENT_TIMEOUT: 5000,
  
  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  
  // Test data
  TEST_USER_PREFIX: 'e2e-test',
  TEST_SERVICE_CATEGORIES: [
    'house-cleaning',
    'electrical-work',
    'plumbing',
    'gardening',
  ],
  
  // Mock data
  MOCK_BOOKING_DATA: {
    address: '123 Test Street, Kathmandu, Nepal',
    timeSlot: 'morning',
    notes: 'E2E test booking - please ignore',
  },
  
  // Payment test data
  MOCK_PAYMENT_DATA: {
    esewa: {
      amount: 1000,
      productCode: 'EPAYTEST',
    },
    khalti: {
      amount: 1000,
      productIdentity: 'test-product',
    },
  },
};

export const SELECTORS = {
  // Navigation
  HERO_SECTION: '[data-testid="hero-section"]',
  SERVICES_GRID: '[data-testid="services-grid"]',
  SERVICE_CARD: '[data-testid="service-card"]',
  
  // Authentication
  LOGIN_FORM: '[data-testid="login-form"]',
  REGISTER_FORM: '[data-testid="register-form"]',
  LOGIN_BUTTON: '[data-testid="login-button"]',
  LOGOUT_BUTTON: '[data-testid="logout-button"]',
  
  // Booking
  BOOKING_FORM: '[data-testid="booking-form"]',
  BOOK_NOW_BUTTON: '[data-testid="book-now-button"]',
  CONFIRM_BOOKING_BUTTON: '[data-testid="confirm-booking-button"]',
  
  // Payment
  PAYMENT_FORM: '[data-testid="payment-form"]',
  ESEWA_BUTTON: '[data-testid="esewa-payment-button"]',
  KHALTI_BUTTON: '[data-testid="khalti-payment-button"]',
  
  // Dashboard
  USER_DASHBOARD: '[data-testid="user-dashboard"]',
  PROVIDER_DASHBOARD: '[data-testid="provider-dashboard"]',
  ADMIN_DASHBOARD: '[data-testid="admin-dashboard"]',
  
  // Common
  LOADING_SPINNER: '[data-testid="loading-spinner"]',
  ERROR_MESSAGE: '[data-testid="error-message"]',
  SUCCESS_MESSAGE: '[data-testid="success-message"]',
};

export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGIN: '/api/auth/login',
  SERVICES: '/api/services',
  BOOKINGS: '/api/bookings',
  PAYMENTS: '/api/payments',
  USERS: '/api/users',
};

export const EXPECTED_ELEMENTS = {
  HOMEPAGE: [
    'SewaGo',
    'Find trusted local service providers',
    'Browse Services',
    'How it Works',
  ],
  SERVICES_PAGE: [
    'Available Services',
    'House Cleaning',
    'Electrical Work',
    'Plumbing',
  ],
  SERVICE_DETAIL: [
    'Book Now',
    'Service Description',
    'Pricing',
    'Reviews',
  ],
  BOOKING_FORM: [
    'Service Date',
    'Time Slot',
    'Address',
    'Confirm Booking',
  ],
};

// Test user generator
export function generateTestUser(prefix: string = TEST_CONFIG.TEST_USER_PREFIX) {
  const timestamp = Date.now();
  return {
    name: `${prefix} User ${timestamp}`,
    email: `${prefix}-user-${timestamp}@example.com`,
    phone: `98765${String(timestamp).slice(-5)}`,
    password: 'TestPassword123!',
  };
}

// Test provider generator
export function generateTestProvider(prefix: string = TEST_CONFIG.TEST_USER_PREFIX) {
  const timestamp = Date.now();
  return {
    name: `${prefix} Provider ${timestamp}`,
    email: `${prefix}-provider-${timestamp}@example.com`,
    phone: `98765${String(timestamp).slice(-5)}`,
    password: 'ProviderPassword123!',
    businessName: `${prefix} Business ${timestamp}`,
    category: 'house-cleaning',
    location: 'Kathmandu',
    description: 'Test provider for E2E testing',
  };
}