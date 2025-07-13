import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        content: resolve(__dirname, "src/content.ts"),
        apiTabContent: resolve(__dirname, "src/apiTabContent.ts"),
        diffTabContent: resolve(__dirname, "src/diffTabContent.ts"),
        background: resolve(__dirname, "src/background.ts"), // optional, 있으면 추가
        // popup: resolve(__dirname, 'src/popup.ts'),         // optional, 있으면 추가
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name]-[hash].js",
        assetFileNames: "[name]-[hash][extname]",
      },
    },
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    target: "esnext",
  },
});
