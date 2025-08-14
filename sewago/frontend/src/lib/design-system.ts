// SewaGo Design System
// Centralized design tokens and component styles for consistent theming

const designSystem = {
  colors: {
    primary: {
      main: '#DC143C',      // Crimson Red - representing the Nepali flag
      light: '#FF6B6B',     // Light Crimson
      dark: '#B91C1C'       // Dark Crimson
    },
    accent: {
      main: '#FF9933',      // Saffron Yellow - representing the Nepali flag
      light: '#FFB366',     // Light Saffron
      dark: '#E67E00'       // Dark Saffron
    },
    dark: {
      main: '#003366',      // Deep Himalayan Blue - representing the mountains
      light: '#0066CC',     // Light Himalayan Blue
      dark: '#001F3F'       // Dark Himalayan Blue
    },
    secondary: {
      main: '#8B4513',      // Saddle Brown - representing the earth
      light: '#A0522D',     // Light Brown
      dark: '#654321'       // Dark Brown
    },
    neutral: {
      white: '#FFFFFF',
      gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827'
      }
    }
  },

  // Gradients
  gradients: {
    hero: 'linear-gradient(135deg, var(--dark-color) 0%, var(--primary-color) 100%)',
    futuristic: 'linear-gradient(135deg, var(--dark-color) 0%, var(--accent-color) 50%, var(--primary-color) 100%)',
    card: 'linear-gradient(145deg, var(--dark-color) 0%, var(--accent-color) 100%)',
    accent: 'linear-gradient(90deg, var(--accent-color) 0%, var(--primary-color) 100%)',
    subtle: 'linear-gradient(135deg, #E0E0E0 0%, #ECF0F1 100%)'
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    glow: '0 0 20px rgba(220, 20, 60, 0.3)',
    'glow-accent': '0 0 20px rgba(255, 153, 51, 0.3)'
  },

  // Spacing
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },

  // Border Radius
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    '3xl': '2rem'
  },

  // Fluid Typography using clamp()
  typography: {
    h1: 'clamp(2rem, 5vw + 1rem, 4rem)',
    h2: 'clamp(1.75rem, 4vw + 1rem, 3rem)',
    h3: 'clamp(1.5rem, 3vw + 1rem, 2.25rem)',
    h4: 'clamp(1.25rem, 2.5vw + 1rem, 1.875rem)',
    h5: 'clamp(1.125rem, 2vw + 1rem, 1.5rem)',
    h6: 'clamp(1rem, 1.5vw + 1rem, 1.25rem)',
    body: 'clamp(0.875rem, 1vw + 0.75rem, 1.125rem)',
    small: 'clamp(0.75rem, 0.5vw + 0.625rem, 0.875rem)',
    large: 'clamp(1.125rem, 1.5vw + 1rem, 1.5rem)',
    xl: 'clamp(1.25rem, 2vw + 1.125rem, 1.875rem)'
  },

  // Responsive Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },

  // Animation Durations
  durations: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms'
  },

  // Z-Index Scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800
  },

  // Utility Functions
  utils: {
    // Container classes with responsive max-widths
    getContainerClasses: (size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'lg') => {
      const maxWidths = {
        sm: 'max-w-3xl',
        md: 'max-w-4xl',
        lg: 'max-w-6xl',
        xl: 'max-w-7xl',
        '2xl': 'max-w-screen-2xl'
      };
      return `mx-auto px-4 sm:px-6 lg:px-8 ${maxWidths[size]}`;
    },

    // Responsive grid classes
    getGridClasses: (cols: { sm?: number; md?: number; lg?: number; xl?: number } = {}) => {
      const defaultCols = { sm: 1, md: 2, lg: 3, xl: 4 };
      const finalCols = { ...defaultCols, ...cols };
      
      return `grid grid-cols-1 ${
        finalCols.sm ? `sm:grid-cols-${finalCols.sm}` : ''
      } ${
        finalCols.md ? `md:grid-cols-${finalCols.md}` : ''
      } ${
        finalCols.lg ? `lg:grid-cols-${finalCols.lg}` : ''
      } ${
        finalCols.xl ? `xl:grid-cols-${finalCols.xl}` : ''
      }`.trim();
    },

    // Responsive spacing classes
    getSpacingClasses: (size: 'sm' | 'md' | 'lg' | 'xl' = 'md') => {
      const spacing = {
        sm: 'py-8 md:py-12 lg:py-16',
        md: 'py-12 md:py-16 lg:py-20',
        lg: 'py-16 md:py-20 lg:py-24',
        xl: 'py-20 md:py-24 lg:py-32'
      };
      return spacing[size];
    },

    // Responsive text alignment
    getTextAlignClasses: (alignment: 'left' | 'center' | 'right' | 'justify' = 'left') => {
      const responsiveAlign = {
        left: 'text-left',
        center: 'text-center sm:text-center',
        right: 'text-right',
        justify: 'text-justify'
      };
      return responsiveAlign[alignment];
    }
  },

  // Component Styles
  componentStyles: {
    card: {
      base: 'glass-card p-6 md:p-8',
      elevated: 'glass-card p-6 md:p-8 hover:scale-105 hover:bg-white/15',
      interactive: 'glass-card p-6 md:p-8 cursor-pointer hover:scale-105 hover:bg-white/15 transition-all duration-300'
    },
    
    button: {
      primary: 'bg-gradient-to-r from-primary to-accent text-white hover:from-primary-light hover:to-accent-light hover:scale-105 active:scale-95 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 min-h-[44px] min-w-[44px]',
      secondary: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:border-white/40 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-xl transition-all duration-300 min-h-[44px] min-w-[44px]',
      outline: 'border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-xl transition-all duration-300 min-h-[44px] min-w-[44px]'
    },
    
    heading: {
      h1: 'font-black tracking-tight text-white',
      h2: 'font-bold tracking-tight text-white',
      h3: 'font-semibold tracking-tight text-white',
      h4: 'font-medium tracking-tight text-white'
    },
    
    text: {
      large: 'text-lg md:text-xl text-white/90 leading-relaxed',
      medium: 'text-base md:text-lg text-white/80 leading-relaxed',
      small: 'text-sm md:text-base text-white/70 leading-relaxed'
    },
    
    input: {
      base: 'w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-300 min-h-[44px]',
      error: 'w-full px-4 py-3 bg-red-500/10 backdrop-blur-md border border-red-500/30 rounded-xl text-white placeholder:text-red-300/50 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 min-h-[44px]'
    },
    
    section: {
      base: 'py-16 md:py-20 lg:py-24',
      small: 'py-12 md:py-16 lg:py-20',
      large: 'py-20 md:py-24 lg:py-32'
    }
  },

  // Responsive Design Patterns
  responsive: {
    // Mobile-first approach
    mobile: {
      padding: 'px-4 py-6',
      spacing: 'space-y-4',
      grid: 'grid-cols-1 gap-4'
    },
    
    tablet: {
      padding: 'px-6 py-8',
      spacing: 'space-y-6',
      grid: 'md:grid-cols-2 gap-6'
    },
    
    desktop: {
      padding: 'px-8 py-12',
      spacing: 'space-y-8',
      grid: 'lg:grid-cols-3 gap-8'
    },
    
    wide: {
      padding: 'px-12 py-16',
      spacing: 'space-y-10',
      grid: 'xl:grid-cols-4 gap-10'
    }
  },

  // Accessibility
  accessibility: {
    // Minimum tap target sizes
    tapTarget: {
      minSize: '44px',
      minHeight: 'min-h-[44px]',
      minWidth: 'min-w-[44px]'
    },
    
    // Focus indicators
    focus: {
      ring: 'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      outline: 'focus-visible:outline-none'
    },
    
    // Screen reader only
    srOnly: 'sr-only',
    srOnlyFocusable: 'sr-only focusable:not-sr-only'
  }
};

export const designUtils = designSystem.utils;
export const componentStyles = designSystem.componentStyles;

export default designSystem;
