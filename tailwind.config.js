/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14213d',
        mint: '#2a9d8f',
        amber: '#f4a261',
        shago: {
          red: '#EF4444',
          redDark: '#DC2626',
          black: '#0F172A',
          gray: '#64748B',
        },
      },
      backgroundImage: {
        'shago-gradient': 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      },
      boxShadow: {
        'red-glow': '0 16px 40px rgba(220, 38, 38, 0.28)',
      },
    },
  },
  plugins: [],
};
