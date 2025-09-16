import express from 'express'
import { Server } from 'http'
import path from 'path'
import { DataPaths } from 'electron-utils/utils'
import { getPortToUse } from 'electron-utils/portManager'

class AssetServer {
  private server: Server | null = null
  private currentPort: number | null = null

  constructor() {
    this.startUp()
  }

  startUp = async () => {
    try {
      const app = express()

      // Use a different port range for assets (starting from 3000)
      const port = await getPortToUse(null, 3000)
      this.currentPort = port

      // Enable CORS for all requests
      app.use((_req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
        next()
      })

      // Serve wallpapers
      const wallpaperPath = path.join(DataPaths.getBaseDataPath(), 'wallpapers')
      app.use('/wallpapers', express.static(wallpaperPath))

      this.server = app.listen(port, () => {
        // Asset server started successfully
      })
    } catch (error) {
      console.error('Error starting asset server:', error)
    }
  }

  getCurrentPort = (): number | null => {
    return this.currentPort
  }

  stop = () => {
    if (this.server) {
      this.server.close()
      this.server = null
      this.currentPort = null
    }
  }

  // Public methods for external access
  public methods = {
    getAssetServerPort: () => this.getCurrentPort(),
    stopAssetServer: this.stop
  }
}

export default AssetServer
