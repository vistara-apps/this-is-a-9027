/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(210, 90%, 30%)',
          50: 'hsl(210, 90%, 95%)',
          100: 'hsl(210, 90%, 90%)',
          500: 'hsl(210, 90%, 30%)',
          600: 'hsl(210, 90%, 25%)',
          700: 'hsl(210, 90%, 20%)',
        },
        accent: {
          DEFAULT: 'hsl(140, 60%, 45%)',
          50: 'hsl(140, 60%, 95%)',
          100: 'hsl(140, 60%, 90%)',
          500: 'hsl(140, 60%, 45%)',
          600: 'hsl(140, 60%, 40%)',
        },
        surface: 'hsl(0, 0%, 100%)',
        border: 'hsl(210, 30%, 85%)',
        text: 'hsl(210, 30%, 15%)',
        bg: 'hsl(210, 20%, 95%)',
      },
      spacing: {
        'sm': '8px',
        'md': '12px',
        'lg': '20px',
        'xl': '32px',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
        'xl': '24px',
      },
      boxShadow: {
        'card': '0 8px 24px hsla(210, 30%, 15%, 0.08)',
        'modal': '0 20px 40px hsla(210, 30%, 15%, 0.16)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.22,1,0.36,1)',
        'slide-up': 'slideUp 0.25s cubic-bezier(0.22,1,0.36,1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}