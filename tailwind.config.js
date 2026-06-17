/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14213d',
        mint: '#2a9d8f',
        amber: '#f4a261',
      },
    },
  },
  plugins: [],
};
