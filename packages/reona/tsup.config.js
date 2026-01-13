const { defineConfig } = require('tsup');

export default defineConfig({
  sourcemap: true,
  minify: true,
  dts: true,
  format: ['esm', 'cjs'],
  clean: true,
  entry: ['src/core/index.ts'],
  outDir: 'dist',
  platform: 'browser',
  define: {
    __DEV__: JSON.stringify(false),
    __TEST__: JSON.stringify(false),
  },
});
