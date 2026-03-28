import { fileURLToPath, URL } from 'node:url';
import inject from '@rollup/plugin-inject';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    rollupOptions: {
      plugins: [
        inject({
          Buffer: ['buffer', 'Buffer'],
        }),
      ],
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          if (id.includes('@ton/')) {
            return 'vendor-ton';
          }

          if (id.includes('qrcode')) {
            return 'vendor-qr';
          }

          if (id.includes('@tanstack/')) {
            return 'vendor-tanstack';
          }

          if (
            id.includes('/react/') ||
            id.includes('/react-dom/')
          ) {
            return 'vendor-react';
          }
        },
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    watch: {
      interval: 1_000,
      usePolling: true,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/vitest-setup.ts'],
  },
});
