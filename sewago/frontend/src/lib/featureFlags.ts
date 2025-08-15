// Feature flags configuration
export const FEATURE_FLAGS = {
  // Notifications system
  NOTIFICATIONS_ENABLED: process.env.NEXT_PUBLIC_NOTIFICATIONS_ENABLED === 'true',
  
  // Push notifications (requires NOTIFICATIONS_ENABLED to be true)
  PUSH_NOTIFICATIONS_ENABLED: process.env.NEXT_PUBLIC_PUSH_NOTIFICATIONS_ENABLED === 'true',
  
  // Socket.IO real-time features
  SOCKET_IO_ENABLED: process.env.NEXT_PUBLIC_SOCKET_IO_ENABLED === 'true',
  
  // Mock mode for development
  MOCK_MODE: process.env.NEXT_PUBLIC_MOCK_MODE === 'true' || process.env.NODE_ENV === 'development',
} as const;

// Helper function to check if notifications are fully enabled
export const isNotificationsEnabled = () => {
  return FEATURE_FLAGS.NOTIFICATIONS_ENABLED && FEATURE_FLAGS.SOCKET_IO_ENABLED;
};

// Helper function to check if push notifications are enabled
export const isPushNotificationsEnabled = () => {
  return isNotificationsEnabled() && FEATURE_FLAGS.PUSH_NOTIFICATIONS_ENABLED;
};

// Default configuration for production
export const DEFAULT_CONFIG = {
  NOTIFICATIONS_ENABLED: false,
  PUSH_NOTIFICATIONS_ENABLED: false,
  SOCKET_IO_ENABLED: false,
  MOCK_MODE: false,
};
