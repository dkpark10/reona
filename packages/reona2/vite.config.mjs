import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
  },
  test: {
    globals: true,
    dir: "./src/tests",
    environment: "jsdom",
  },
  define: {
    __DEV__: process.env.NODE_ENV === "development" || process.env.NODE_ENV === 'test',
  },
});
