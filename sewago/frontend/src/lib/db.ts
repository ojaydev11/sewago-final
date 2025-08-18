// Database operations are now handled by the backend API
// This file maintains compatibility for any legacy imports

export const db = {
  // Deprecated - use API calls instead
  _deprecated: true,
};

// Helper to remind developers to use API calls
if (process.env.NODE_ENV === 'development') {
  console.warn('⚠️ Direct database access deprecated - use API endpoints instead');
}
