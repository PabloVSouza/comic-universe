import express, { Router } from 'express'
import { Server } from 'http'
import path from 'path'

import cors from 'cors'
import Methods from './Methods'
import SettingsRepository from './Methods/SettingsRepository'
import { getPortToUse } from 'electron-utils/portManager'
import { DataPaths } from 'electron-utils/utils'

class ApiManager {
  private settingsRepository: SettingsRepository
  private server: Server | null = null
  private methodsInstance: Methods
  private currentPort: number | null = null

  constructor(methods: Methods) {
    this.methodsInstance = methods
    this.settingsRepository = new SettingsRepository()
    // Defer startup to allow async settings check
    setImmediate(() => {
      this.startUp()
    })
  }

  startUp = async () => {
    try {
      // Check if web UI is enabled
      const webUISettings = await this.settingsRepository.methods.getWebUISettings()
      if (!webUISettings.enableWebUI) {
        return
      }

      const app = express()
      const port = await getPortToUse(this.settingsRepository)
      this.currentPort = port

      app.use(
        cors({
          origin: true,
          credentials: true,
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
        })
      )

      // Add CORS headers to all responses
      app.use((_req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        res.header(
          'Access-Control-Allow-Headers',
          'Origin, X-Requested-With, Content-Type, Accept, Authorization'
        )
        next()
      })

      app.use(express.json())
      const routes = this.generateRoutes()
      app.use(routes)

      this.server = app.listen(port, () => {
        // API server started
      })
    } catch (error) {
      // Error starting API server
    }
  }

  // Method to restart server when web UI setting changes
  restartServer = async () => {
    // Stop existing server if running
    if (this.server) {
      this.server.close()
      this.server = null
    }

    // Start server again (will check setting)
    await this.startUp()
  }

  // Public methods for external access
  public methods = {
    restartServer: this.restartServer
  }

  generateRoutes = () => {
    const routes = Router()
    const { methods: apiMethods } = this.methodsInstance
    const properties = Object.getOwnPropertyNames(apiMethods)

    // Methods are being exposed for WebUI access

    const frontendPath = path.join(__dirname, '..', '..', 'out', 'renderer')
    const pluginsPath = DataPaths.getPluginsPath()
    const wallpaperPath = path.join(DataPaths.getBaseDataPath(), 'wallpapers')

    routes.use('/', express.static(frontendPath))
    routes.use('/api/plugins', express.static(pluginsPath + '/'))
    routes.use('/api/wallpapers', express.static(wallpaperPath + '/'))

    // Proxy route for external images to bypass CORS
    routes.get('/api/proxy-image', async (req, res): Promise<void> => {
      try {
        const imageUrl = req.query.url as string

        if (!imageUrl) {
          res.status(400).json({ error: 'URL parameter is required' })
          return
        }

        // Validate that it's a valid image URL
        if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
          res.status(400).json({ error: 'Invalid URL' })
          return
        }

        const response = await fetch(imageUrl)

        if (!response.ok) {
          res.status(response.status).json({ error: 'Failed to fetch image' })
          return
        }

        // Set appropriate headers
        const contentType = response.headers.get('content-type')
        if (contentType) {
          res.set('Content-Type', contentType)
        }

        // Set CORS headers
        res.set('Access-Control-Allow-Origin', '*')
        res.set('Access-Control-Allow-Methods', 'GET')
        res.set('Access-Control-Allow-Headers', 'Content-Type')

        // Get the image data and send it
        const imageBuffer = await response.arrayBuffer()
        res.send(Buffer.from(imageBuffer))
      } catch (error) {
        // Error proxying image
        res.status(500).json({ error: 'Internal server error' })
      }
    })

    for (const method of properties) {
      routes.post(`/${method}`, async (req, res) => {
        return res.json(await apiMethods[method](req.body))
      })
    }

    return routes
  }

  // Get the current port the server is running on
  getCurrentPort = (): number | null => {
    return this.currentPort
  }
}

export default ApiManager
