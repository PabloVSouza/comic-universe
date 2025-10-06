import { Server } from 'http'
import path from 'path'
import cors from 'cors'
import { DataPaths } from 'electron-utils'
import { getPortToUse } from 'electron-utils/portManager'
import express, { Router } from 'express'
import Methods from './Methods'
import SettingsRepository from './Methods/SettingsRepository'

class ApiManager {
  private settingsRepository: SettingsRepository
  private server: Server | null = null
  private methodsInstance: Methods
  private currentPort: number | null = null

  constructor(methods: Methods) {
    this.methodsInstance = methods
    this.settingsRepository = new SettingsRepository()
    setImmediate(() => {
      this.startUp()
    })
  }

  startUp = async () => {
    try {
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
      })
    } catch (error) {
    }
  }

  restartServer = async () => {
    if (this.server) {
      this.server.close()
      this.server = null
    }

    await this.startUp()
  }

  public methods = {
    restartServer: this.restartServer
  }

  generateRoutes = () => {
    const routes = Router()
    const { methods: apiMethods } = this.methodsInstance
    const properties = Object.getOwnPropertyNames(apiMethods)


    const frontendPath = path.join(__dirname, '..', '..', 'out', 'renderer')
    const pluginsPath = DataPaths.getPluginsPath()
    const wallpaperPath = path.join(DataPaths.getBaseDataPath(), 'wallpapers')

    routes.use('/', express.static(frontendPath))
    routes.use('/api/plugins', express.static(pluginsPath + '/'))
    routes.use('/api/wallpapers', express.static(wallpaperPath + '/'))

    routes.get('/api/proxy-image', async (req, res): Promise<void> => {
      try {
        const imageUrl = req.query.url as string

        if (!imageUrl) {
          res.status(400).json({ error: 'URL parameter is required' })
          return
        }

        if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
          res.status(400).json({ error: 'Invalid URL' })
          return
        }

        const response = await fetch(imageUrl)

        if (!response.ok) {
          res.status(response.status).json({ error: 'Failed to fetch image' })
          return
        }

        const contentType = response.headers.get('content-type')
        if (contentType) {
          res.set('Content-Type', contentType)
        }

        res.set('Access-Control-Allow-Origin', '*')
        res.set('Access-Control-Allow-Methods', 'GET')
        res.set('Access-Control-Allow-Headers', 'Content-Type')

        const imageBuffer = await response.arrayBuffer()
        res.send(Buffer.from(imageBuffer))
      } catch (error) {
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

  getCurrentPort = (): number | null => {
    return this.currentPort
  }
}

export default ApiManager
