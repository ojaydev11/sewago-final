
// Minimal middleware to avoid Edge Runtime issues
export function middleware() {
  // Temporarily disable middleware completely to resolve Edge Runtime issues
  // This allows the app to deploy while we investigate the dependency issues
  
  // TODO: Re-implement internationalization after deployment is successful
  return;
}

export const config = {
  // Disable middleware temporarily
  matcher: []
};
