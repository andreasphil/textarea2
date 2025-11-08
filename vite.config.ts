import { defineConfig } from "rolldown-vite";

export default defineConfig({
  build: {
    lib: {
      entry: "./src/textarea2.ts",
      formats: ["es"],
    },
    minify: false,
    target: "esnext",
  },
});
