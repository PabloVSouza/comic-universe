import RepoPluginsLoader from '../repositories/Implementations/PluginsImplementation'
import { DBInteractionsRepository } from '../repositories/Implementations/DBImplementations/DBImplementationsRepository'
import { app } from 'electron'

const Startup = async () => {
  const repoPluginsObject = new RepoPluginsLoader()

  await repoPluginsObject.startUp()

  const path = app.getPath('userData')

  const repoDBObject = new DBInteractionsRepository(path)

  await repoDBObject.startup()

  return { repoPluginsObject, repoDBObject }
}

export type Startup = Awaited<ReturnType<typeof Startup>>

export default Startup
