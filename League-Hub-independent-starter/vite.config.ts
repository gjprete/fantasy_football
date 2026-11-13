import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@generated': path.resolve(__dirname, 'src/generated'),
      '@lib': path.resolve(__dirname, 'src/lib'),
    },
  },
});
