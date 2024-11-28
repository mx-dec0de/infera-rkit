import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['ethers'], // Указываем, что Vite должен оптимизировать ethers
  },
  resolve: {
    alias: {
      stream: 'stream-browserify', // Если ethers требует stream
    },
  },
  build: {
    rollupOptions: {
      external: ['ethers'], // Указываем ethers как внешнюю зависимость для сборки
    },
  },
});