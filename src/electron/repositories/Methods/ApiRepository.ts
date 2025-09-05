import type PluginsRepository from './PluginsRepository'

class ApiRepository {
  public properties = [] as string[]
  public methods = {}
  constructor(public pluginsRepository: PluginsRepository) {
    const repoList = pluginsRepository.activePlugins

    if (Object.values(repoList).length > 0) {
      for (const repo of Object.getOwnPropertyNames(repoList)) {
        const repoProps = Object.getOwnPropertyNames(repoList[repo].methods)
        for (const prop of repoProps) {
          if (!this.properties.includes(prop)) this.properties.push(prop)
        }
      }
    }

    this.methods = this.properties.reduce((acc, cur) => {
      return {
        ...acc,
        [cur]: async ({ repo, data }) => repoList[repo].methods[cur](data)
      }
    }, {})
  }
}

export default ApiRepository
