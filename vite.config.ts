import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: path.resolve(__dirname, 'postcss.config.js'),
  },
  
  resolve: {
    alias: {
      // Полифилы для Node.js модулей, если они требуются для ethers
      stream: 'stream-browserify',
      buffer: 'buffer',
      process: 'process/browser',
    },
  },
  optimizeDeps: {

    include: ['ethers'],
  },
  build: {
    rollupOptions: {

      external: [],
    },
  },
  define: {

    'process.env': {},
  },
});
