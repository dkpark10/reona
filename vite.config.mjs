import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    dir: './src/tests',
    environment: 'jsdom',
  },
});
