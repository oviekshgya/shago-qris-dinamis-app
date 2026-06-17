/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Shago Brand Colors
        'shago-red': '#EF4444',
        'shago-red-dark': '#DC2626',
        'shago-red-darker': '#991B1B',
        'shago-black': '#0F172A',
        'shago-gray': '#64748B',
        // Keep existing colors for compatibility
        ink: '#14213d',
        mint: '#2a9d8f',
        amber: '#f4a261',
      },
      backgroundImage: {
        'shago-gradient': 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
        'shago-gradient-dark': 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
      },
    },
  },
  plugins: [],
};
