import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Vite Configuration
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2015",
    minify: "esbuild",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});
