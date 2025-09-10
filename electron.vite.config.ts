import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  main: {
    build: {
      lib: {
        entry: 'src/electron/main/index.ts'
      }
    },
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        main: resolve('src/electron/main'),
        preload: resolve('src/electron/preload'),
        repositories: resolve('src/electron/repositories'),
        scripts: resolve('src/electron/scripts'),
        utils: resolve('src/electron/utils'),
        windows: resolve('src/electron/windows'),
        database: resolve('src/database'),
        constants: resolve('src/electron/constants'),
        shared: resolve('src/shared')
      }
    }
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
    build: {
      assetsInlineLimit: 0
    },
    plugins: [react(), svgr()],
    resolve: {
      alias: {
        '@': resolve('src/renderer/'),
        assets: resolve('src/renderer/assets'),
        api: resolve('src/renderer/api'),
        components: resolve('src/renderer/components'),
        lang: resolve('src/renderer/lang'),
        hooks: resolve('src/renderer/hooks'),
        pages: resolve('src/renderer/pages'),
        functions: resolve('src/renderer/functions'),
        routes: resolve('src/renderer/routes'),
        css: resolve('src/renderer/css'),
        store: resolve('src/renderer/store'),
        constants: resolve('src/renderer/constants'),
        shared: resolve('src/shared')
      }
    }
  }
})
