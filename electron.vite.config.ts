import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    build: {
      lib: {
        entry: 'src/electron/main/index.ts'
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    build: {
      lib: {
        entry: 'src/electron/preload/index.ts'
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/scss/style.scss"; @import "@/scss/base/fonts/roboto/roboto.scss";`
        }
      }
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve('src/renderer/'),
        assets: resolve('src/renderer/assets'),
        components: resolve('src/renderer/components'),
        lang: resolve('src/renderer/lang'),
        hooks: resolve('src/renderer/hooks'),
        pages: resolve('src/renderer/pages'),
        routes: resolve('src/renderer/routes'),
        scss: resolve('src/renderer/scss'),
        store: resolve('src/renderer/store')
      }
    }
  }
})
