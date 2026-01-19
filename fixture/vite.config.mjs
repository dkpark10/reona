import { defineConfig } from "vite";
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      'reona-x': path.resolve(__dirname, "../packages/reona-x/src/core"),
    }
  },
  define: {
    __DEV__: process.env.NODE_ENV === "development",
    __TEST__: process.env.NODE_ENV === 'test',
  },
});
