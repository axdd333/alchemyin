/// <reference types="vitest" />

import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/alchemyin/',
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        systems: resolve(__dirname, 'systems.html'),
        philosophy: resolve(__dirname, 'philosophy.html')
      }
    }
  },
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts']
  }
});
