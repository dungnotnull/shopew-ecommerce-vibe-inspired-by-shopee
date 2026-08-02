import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Cấu hình Vite Dev Server cho Frontend (Port 3001) & Proxy tự động trỏ API sang Backend NestJS (Port 3000)
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
