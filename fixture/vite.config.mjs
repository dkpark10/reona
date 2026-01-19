import { defineConfig } from "vite";

export default defineConfig({
  define: {
    __DEV__: process.env.NODE_ENV === "development",
    __TEST__: process.env.NODE_ENV === 'test',
  },
});
