import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    dir: './src/tests',
    environment: 'jsdom',
    setupFiles: './setupTest.js',
  },
  define: {
    __DEV__: process.env.NODE_ENV === 'development',
    __TEST__: process.env.NODE_ENV === 'test',
  },
});
