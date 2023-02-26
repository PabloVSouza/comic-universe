import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  main: {
    build: {
      lib: {
        entry: "src/electron/main/index.js",
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    build: {
      lib: {
        entry: "src/electron/preload/index.js",
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/scss/style.scss";`,
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": resolve("src/renderer/"),
        assets: resolve("src/renderer/assets"),
        components: resolve("src/renderer/components"),
        lang: resolve("src/renderer/lang"),
        pages: resolve("src/renderer/pages"),
        routes: resolve("src/renderer/routes"),
        scss: resolve("src/renderer/scss"),
        store: resolve("src/renderer/store"),
      },
    },
  },
});
