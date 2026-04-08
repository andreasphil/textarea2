import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "./src/textarea2.js",
      formats: ["es"],
    },
    minify: false,
    target: "esnext",
  },
});
