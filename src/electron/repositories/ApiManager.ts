import express, { Router } from 'express'

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

    routes.get('*', (_, res) => {
      res.json({ message: 'Welcome to Comic Universe' })
    })

    for (const method of properties) {
      routes.post(`/${method}`, async (req, res) => {
        return res.json(await apiMethods[method](req.body))
      })
    }

    return routes
  }
}

export default ApiManager
