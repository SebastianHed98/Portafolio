/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'netflix-red': '#E50914',
        'netflix-black': '#141414',
        'netflix-dark': '#000000',
        'netflix-gray': '#808080',
        'netflix-light-gray': '#E5E5E5',
      },
      fontFamily: {
        netflix: ['Inter', 'Helvetica Neue', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
