/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Luxury premium brand palette
        luxury: {
          dark: '#111827',
          gray: '#374151',
          accent: '#C23D17', // Sienna 600
          hover: '#A12F0E',  // Terracotta 700
          bg: '#F8FAFC',
          border: '#E5E7EB',
          text: '#1F2937',
          textMuted: '#6B7280',
        },
        sienna: {
          50: '#FDF4F0',
          100: '#FCE7DF',
          200: '#F8C8B9',
          300: '#F19F87',
          400: '#E7704E',
          500: '#D94D25',
          600: '#C23D17',
          700: '#A12F0E',
          750: '#902A0D',
          800: '#81250E',
          900: '#68200F',
          950: '#380E05',
        }
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(17, 24, 39, 0.05)',
        'luxury-hover': '0 30px 60px -15px rgba(17, 24, 39, 0.12)',
        'accent-glow': '0 0 20px rgba(194, 61, 23, 0.25)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
