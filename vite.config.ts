import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const host = process.env.TAURI_DEV_HOST;

// Get current directory path in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],

  // Asset handling for Tauri
  build: {
    // Ensure assets are properly handled in Tauri
    assetsInlineLimit: 0, // Don't inline assets, let them be processed properly
  },

  // Configure asset handling
  assetsInclude: ['**/*.svg'],

  // Path resolution
  resolve: {
    alias: {
      api: path.resolve(__dirname, "./src/api"),
      components: path.resolve(__dirname, "./src/components"),
      functions: path.resolve(__dirname, "./src/functions"),
      hooks: path.resolve(__dirname, "./src/hooks"),
      lang: path.resolve(__dirname, "./src/lang"),
      pages: path.resolve(__dirname, "./src/pages"),
      routes: path.resolve(__dirname, "./src/routes"),
      store: path.resolve(__dirname, "./src/store"),
      css: path.resolve(__dirname, "./src/css"),
      assets: path.resolve(__dirname, "./src/assets"),
      "@types": path.resolve(__dirname, "./src/@types"),
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: [
        "**/src-tauri/**",
        "**/database.db*", // Ignore SQLite database files
        "**/**.db-shm",   // Ignore SQLite shared memory files
        "**/**.db-wal"    // Ignore SQLite write-ahead log files
      ],
    },
  },
}));
