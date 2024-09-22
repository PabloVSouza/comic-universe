import express, { Router } from 'express'
import path from 'path'

import cors from 'cors'
import Methods from './Methods'

class ApiManager {
  constructor(private methods: Methods) {
    this.startUp()
  }

  startUp = () => {
    const app = express()
    const port = 8888

    app.use(cors())
    app.use(express.json())
    const routes = this.generateRoutes()
    app.use(routes)

    app.listen(port, () => {
      console.log('====================')
      console.log(`Api is up on port $port`)
      console.log('====================')
    })
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
