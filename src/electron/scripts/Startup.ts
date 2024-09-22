import PluginsRepository from '../repositories/Methods/PluginsRepository'
import DBRepository from '../repositories/Methods/DBRepository'

import { app } from 'electron'

const Startup = async () => {
  const repoPluginsObject = new PluginsRepository()

  await repoPluginsObject.startUp()

  const path = app.getPath('userData')

  const repoDBObject = new DBRepository(path)

  await repoDBObject.startup()

  return { repoPluginsObject, repoDBObject }
}

export type Startup = Awaited<ReturnType<typeof Startup>>

export default Startup
