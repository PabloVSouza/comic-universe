import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync, cpSync } from 'fs'

export default defineConfig({
  main: {
    build: {
      lib: {
        entry: 'src/electron/main/index.ts'
      }
    },
    plugins: [
      externalizeDepsPlugin(),
      {
        name: 'copy-migrations',
        writeBundle() {
          const migrationsSource = resolve('src/database/migrations')
          const migrationsTarget = resolve('out/database/migrations')

          if (existsSync(migrationsSource)) {
            mkdirSync(migrationsTarget, { recursive: true })

            const files = readdirSync(migrationsSource)

            for (const file of files) {
              const sourcePath = resolve(migrationsSource, file)
              const targetPath = resolve(migrationsTarget, file)

              if (statSync(sourcePath).isDirectory()) {
                cpSync(sourcePath, targetPath, { recursive: true })
              } else {
                copyFileSync(sourcePath, targetPath)
              }
            }

            console.log('✅ Migration files copied to build output')
          }
        }
      }
    ],
    resolve: {
      alias: {
        main: resolve('src/electron/main'),
        preload: resolve('src/electron/preload'),
        repositories: resolve('src/electron/repositories'),
        scripts: resolve('src/electron/scripts'),
        'electron-utils': resolve('src/electron/utils'),
        windows: resolve('src/electron/windows'),
        database: resolve('src/database'),
        constants: resolve('src/electron/constants'),
        shared: resolve('src/shared'),
        'shared-utils': resolve('src/utils')
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
    plugins: [
      react(),
      {
        name: 'copy-icons',
        writeBundle() {
          const iconFiles = ['src/renderer/assets/icon.svg', 'build/icon-256.png']

          const targetDir = resolve('out/renderer')

          for (const iconFile of iconFiles) {
            if (existsSync(iconFile)) {
              const fileName = iconFile.split('/').pop()
              if (fileName) {
                const targetPath = resolve(targetDir, fileName)
                copyFileSync(iconFile, targetPath)
                console.log(`✅ Copied ${fileName} to build output`)
              }
            }
          }
        }
      }
    ],
    resolve: {
      alias: {
        '@': resolve('src/renderer/'),
        assets: resolve('src/renderer/assets'),
        api: resolve('src/renderer/api'),
        components: resolve('src/renderer/components'),
        lang: resolve('src/renderer/lang'),
        hooks: resolve('src/renderer/hooks'),
        layouts: resolve('src/renderer/layouts'),
        windows: resolve('src/renderer/windows'),
        functions: resolve('src/renderer/functions'),
        routes: resolve('src/renderer/routes'),
        css: resolve('src/renderer/css'),
        store: resolve('src/renderer/store'),
        constants: resolve('src/renderer/constants'),
        'renderer-utils': resolve('src/renderer/utils'),
        shared: resolve('src/shared'),
        'shared-utils': resolve('src/utils')
      }
    }
  }
})
