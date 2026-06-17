import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const qrisApiTarget = process.env.VITE_QRIS_PROXY_TARGET || 'https://generate-qris.shagya-tech.my.id';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: qrisApiTarget,
        changeOrigin: true,
        secure: true,
      },
      '/health': {
        target: qrisApiTarget,
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
