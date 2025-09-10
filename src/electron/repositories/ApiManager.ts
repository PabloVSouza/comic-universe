import express, { Router } from 'express'
import path from 'path'

import cors from 'cors'
import Methods from './Methods'
import SettingsRepository from './Methods/SettingsRepository'

class ApiManager {
  private settingsRepository: SettingsRepository
  private server: any = null

  constructor(private methods: Methods) {
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
      console.log('ApiManager startup - Web UI setting:', webUISettings.enableWebUI)
      
      if (!webUISettings.enableWebUI) {
        console.log('Web UI is disabled - Express server not started')
        return
      }

      const app = express()
      const port = 8888

      app.use(cors())
      app.use(express.json())
      const routes = this.generateRoutes()
      app.use(routes)

      this.server = app.listen(port, () => {
        console.log('====================')
        console.log(`Api is up on port ${port}`)
        console.log('====================')
      })
    } catch (error) {
      console.error('Error starting API server:', error)
    }
  }

  // Method to restart server when web UI setting changes
  restartServer = async () => {
    // Stop existing server if running
    if (this.server) {
      this.server.close()
      this.server = null
      console.log('Express server stopped')
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
    const { methods: apiMethods } = this.methods
    const properties = Object.getOwnPropertyNames(apiMethods)

    const frontendPath = path.join(__dirname, '..', '..', 'out', 'renderer')
    const pluginsPath = path.join(__dirname, '..', '..', 'plugins')

    routes.use('/', express.static(frontendPath))
    routes.use('/api/plugins', express.static(pluginsPath + '/'))

    for (const method of properties) {
      routes.post(`/${method}`, async (req, res) => {
        return res.json(await apiMethods[method](req.body))
      })
    }

    return routes
  }
}

export default ApiManager
