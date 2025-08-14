import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}','./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}','./pages/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Sleek & Futuristic Palette
        'sg-primary': '#1C1C2A',      // Deep Slate Blue
        'sg-secondary': '#E0E0E0',    // Light Gray
        'sg-accent1': '#FF5C93',      // Hot Pink
        'sg-accent2': '#00FFA3',      // Spring Green
        
        // Classy & Modern Palette (Alternative)
        'sg-charcoal': '#2C3E50',     // Charcoal
        'sg-silver': '#ECF0F1',       // Silver
        'sg-river': '#3498DB',        // Peter River Blue
        'sg-crimson': '#E74C3C',      // Alizarin Crimson
        
        // Legacy colors for backward compatibility
        'sg-primaryDark': '#0A4FA0',
        'sg-text': '#0F2B46',
        'sg-sky1': '#E9F2FF',
        'sg-sky2': '#CFE3FF',
        'sg-gold': '#F3C54E',
        
        // Additional colors for CSS compatibility
        'primary': '#DC143C',         // Crimson Red
        'accent': '#FF9933',          // Saffron Yellow
        'dark': '#003366',            // Deep Himalayan Blue
        'secondary': '#8B4513'        // Saddle Brown
      },
      backgroundImage: {
        'gradient-futuristic': 'linear-gradient(135deg, #1C1C2A 0%, #3C339A 50%, #FF5C93 100%)',
        'gradient-hero': 'linear-gradient(135deg, #1C1C2A 0%, #2C3E50 100%)',
        'gradient-card': 'linear-gradient(145deg, #1C1C2A 0%, #2C3E50 100%)',
        'gradient-accent': 'linear-gradient(90deg, #FF5C93 0%, #00FFA3 100%)',
        'gradient-subtle': 'linear-gradient(135deg, #E0E0E0 0%, #ECF0F1 100%)'
      },
      boxShadow: {
        'futuristic': '0 8px 32px rgba(28, 28, 42, 0.3)',
        'card': '0 6px 24px rgba(15,43,70,0.08)',
        'glow': '0 0 20px rgba(255, 92, 147, 0.3)',
        'glow-green': '0 0 20px rgba(0, 255, 163, 0.3)'
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 92, 147, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 92, 147, 0.6)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      }
    }
  },
  plugins: []
} satisfies Config;
