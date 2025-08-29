// Demo configuration
export const DEMO_CONFIG = {
  enabled: process.env.NEXT_PUBLIC_ENABLE_DEMOS === 'true',
  routes: {
    reviewSystem: '/demo/review-system',
    reviewSystemDemo: '/demo/review-system/demo',
  },
  features: {
    photoUpload: true,
    reviewForm: true,
    photoGallery: true,
  },
};

// Helper function to check if demos are enabled
export const isDemoEnabled = () => DEMO_CONFIG.enabled;

// Helper function to get demo routes
export const getDemoRoutes = () => DEMO_CONFIG.routes;

// Helper function to check if a specific demo feature is enabled
export const isDemoFeatureEnabled = (feature: keyof typeof DEMO_CONFIG.features) => {
  return DEMO_CONFIG.enabled && DEMO_CONFIG.features[feature];
};
