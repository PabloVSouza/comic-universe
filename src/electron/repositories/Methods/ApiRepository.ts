import type { Startup } from '../../scripts/Startup'

class ApiRepository {
  public methods = [] as string[]
  public repoList = {}
  constructor(public startupObject: Startup) {
    const { repoPluginsObject } = startupObject

    this.repoList = repoPluginsObject.activePlugins

    if (Object.values(this.repoList).length > 0) {
      for (const repo of Object.getOwnPropertyNames(this.repoList)) {
        const repoProps = Object.getOwnPropertyNames(this.repoList[repo].methods)
        for (const prop of repoProps) {
          if (!this.methods.includes(prop)) this.methods.push(prop)
        }
      }
    }
  }
}

export default ApiRepository
