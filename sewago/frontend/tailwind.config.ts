import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  safelist: [
    { pattern: /(bg|text|border)-(red|blue|green|yellow|gray|zinc|neutral)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /(p|px|py|m|mx|my)-([0-9]|1[0-2])/ },
    { pattern: /(sm|md|lg|xl|2xl):.*/ }
  ],
  plugins: [],
};

export default config;