import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

function resolve(path: string) {
  return fileURLToPath(new URL(path, import.meta.url));
}

export default defineConfig({
  resolve: { alias: { "@": resolve("./src") } },

  build: {
    target: "esnext",
    lib: {
      entry: {
        textarea2: resolve("./src/textarea2.ts"),
        plugins: resolve("./src/plugins/index.ts"),
      },
      formats: ["es"],
    },
  },
});
