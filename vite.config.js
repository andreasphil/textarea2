import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "./src/textarea2.js",
      formats: ["es"],
      fileName: (_, entryname) => `${entryname}.js`,
    },
    minify: false,
    target: "esnext",
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test-setup.js"],
  },
});
