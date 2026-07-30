import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Cấu hình Vite Dev Server và Path Alias trỏ vào src/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
