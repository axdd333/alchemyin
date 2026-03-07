/// <reference types="vitest" />

import { defineConfig } from 'vite';

export default defineConfig({
  base: '/alchemyin/',
  build: {
    target: 'es2022'
  },
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts']
  }
});
