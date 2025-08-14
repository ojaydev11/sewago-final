// SewaGo Design System
// Centralized design tokens and component styles for consistent theming

export const designSystem = {
  // Color Palette
  colors: {
    primary: {
      main: '#1C1C2A',      // Deep Slate Blue
      light: '#2C3E50',     // Charcoal
      dark: '#0A4FA0'       // Legacy primary
    },
    secondary: {
      main: '#E0E0E0',      // Light Gray
      light: '#ECF0F1',     // Silver
      dark: '#0F2B46'       // Legacy text
    },
    accent: {
      pink: '#FF5C93',      // Hot Pink
      green: '#00FFA3',     // Spring Green
      blue: '#3498DB',      // Peter River Blue
      red: '#E74C3C'        // Alizarin Crimson
    },
    legacy: {
      sky1: '#E9F2FF',
      sky2: '#CFE3FF',
      gold: '#F3C54E'
    }
  },

  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      mono: ['ui-monospace', 'SFMono-Regular', 'monospace']
    },
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem',   // 60px
      '7xl': '4.5rem',    // 72px
      '8xl': '6rem'       // 96px
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900'
    },
    lineHeight: {
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2'
    }
  },

  // Spacing
  spacing: {
    xs: '0.5rem',    // 8px
    sm: '0.75rem',   // 12px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '5rem',   // 80px
    '5xl': '6rem',   // 96px
    '6xl': '8rem'    // 128px
  },

  // Gradients
  gradients: {
    hero: 'linear-gradient(135deg, #1C1C2A 0%, #2C3E50 100%)',
    futuristic: 'linear-gradient(135deg, #1C1C2A 0%, #3C339A 50%, #FF5C93 100%)',
    card: 'linear-gradient(145deg, #1C1C2A 0%, #2C3E50 100%)',
    accent: 'linear-gradient(90deg, #FF5C93 0%, #00FFA3 100%)',
    subtle: 'linear-gradient(135deg, #E0E0E0 0%, #ECF0F1 100%)'
  },

  // Shadows
  shadows: {
    futuristic: '0 8px 32px rgba(28, 28, 42, 0.3)',
    card: '0 6px 24px rgba(15,43,70,0.08)',
    glow: '0 0 20px rgba(255, 92, 147, 0.3)',
    'glow-green': '0 0 20px rgba(0, 255, 163, 0.3)'
  },

  // Animations
  animations: {
    fadeIn: 'fadeIn 0.6s ease-in-out',
    slideUp: 'slideUp 0.8s ease-out',
    pulseGlow: 'pulseGlow 2s ease-in-out infinite',
    float: 'float 3s ease-in-out infinite'
  },

  // Border Radius
  borderRadius: {
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    '3xl': '2rem'     // 32px
  },

  // Layout
  layout: {
    container: {
      maxWidth: '80rem',  // 1280px
      padding: {
        mobile: '1rem',   // 16px
        tablet: '1.5rem', // 24px
        desktop: '2rem'   // 32px
      }
    },
    section: {
      padding: {
        mobile: '3rem',   // 48px
        tablet: '4rem',   // 64px
        desktop: '5rem'   // 80px
      }
    }
  }
};

// Component-specific styles
export const componentStyles = {
  // Button variants
  button: {
    base: 'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-300 focus-visible:ring-2 focus-visible:ring-sg-accent1 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    primary: 'bg-gradient-accent text-sg-secondary hover:scale-105 active:scale-95 px-8 py-4 text-base shadow-glow hover:shadow-futuristic',
    secondary: 'bg-sg-primary/50 border border-sg-accent1/20 text-sg-secondary hover:bg-sg-accent1/10 hover:border-sg-accent1/40 px-6 py-3 text-base',
    outline: 'border-2 border-sg-accent1 text-sg-accent1 hover:bg-sg-accent1 hover:text-sg-secondary px-6 py-3 text-base'
  },

  // Card variants
  card: {
    base: 'bg-sg-primary/95 backdrop-blur-xl border border-sg-accent1/20 rounded-3xl shadow-futuristic hover:shadow-glow transition-all duration-300',
    elevated: 'bg-sg-primary/95 backdrop-blur-xl border border-sg-accent1/20 rounded-3xl shadow-futuristic hover:shadow-glow transition-all duration-300 hover:scale-105'
  },

  // Section variants
  section: {
    base: 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
    spacing: {
      sm: 'py-16',
      md: 'py-20',
      lg: 'py-24'
    }
  },

  // Typography variants
  heading: {
    h1: 'text-6xl sm:text-7xl lg:text-8xl font-black text-sg-secondary leading-tight',
    h2: 'text-4xl sm:text-5xl font-black text-sg-secondary leading-tight',
    h3: 'text-3xl sm:text-4xl font-bold text-sg-secondary leading-tight',
    h4: 'text-2xl sm:text-3xl font-semibold text-sg-secondary leading-tight'
  },

  // Text variants
  text: {
    large: 'text-xl text-sg-secondary/80 font-light leading-relaxed',
    medium: 'text-lg text-sg-secondary/70 font-medium leading-relaxed',
    small: 'text-base text-sg-secondary/60 font-normal leading-relaxed',
    caption: 'text-sm text-sg-secondary/50 font-mono'
  }
};

// Utility functions for consistent styling
export const designUtils = {
  // Get responsive container classes
  getContainerClasses: (size: 'sm' | 'md' | 'lg' = 'md') => {
    const base = componentStyles.section.base;
    const spacing = componentStyles.section.spacing[size];
    return `${base} ${spacing}`;
  },

  // Get button classes
  getButtonClasses: (variant: 'primary' | 'secondary' | 'outline' = 'primary') => {
    const base = componentStyles.button.base;
    const variantStyle = componentStyles.button[variant];
    return `${base} ${variantStyle}`;
  },

  // Get card classes
  getCardClasses: (variant: 'base' | 'elevated' = 'base') => {
    return componentStyles.card[variant];
  },

  // Get heading classes
  getHeadingClasses: (level: 'h1' | 'h2' | 'h3' | 'h4') => {
    return componentStyles.heading[level];
  },

  // Get text classes
  getTextClasses: (size: 'large' | 'medium' | 'small' | 'caption') => {
    return componentStyles.text[size];
  }
};

export default designSystem;
