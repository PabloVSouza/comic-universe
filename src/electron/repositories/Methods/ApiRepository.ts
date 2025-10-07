import type PluginsRepository from './PluginsRepository'

class ApiRepository {
  public properties = [] as string[]
  public methods = {}

  constructor(public pluginsRepository: PluginsRepository) {
    const repoList = pluginsRepository.activePlugins

    const commonMethods = {
      getList: async ({ repo }) => {
        if (!repo || !repoList[repo]) {
          throw new Error(`Plugin '${repo}' not found or not loaded`)
        }
        return repoList[repo].methods.getList()
      },
      search: async ({ repo, data }) => {
        if (!repo || !repoList[repo]) {
          throw new Error(`Plugin '${repo}' not found or not loaded`)
        }
        return repoList[repo].methods.search(data)
      },
      getDetails: async ({ repo, data }) => {
        if (!repo || !repoList[repo]) {
          throw new Error(`Plugin '${repo}' not found or not loaded`)
        }
        return repoList[repo].methods.getDetails(data)
      },
      getChapters: async ({ repo, data }) => {
        if (!repo || !repoList[repo]) {
          throw new Error(`Plugin '${repo}' not found or not loaded`)
        }
        return repoList[repo].methods.getChapters(data)
      },
      getPages: async ({ repo, data }) => {
        if (!repo || !repoList[repo]) {
          throw new Error(`Plugin '${repo}' not found or not loaded`)
        }
        return repoList[repo].methods.getPages?.(data)
      },
      downloadChapter: async ({ repo, data }) => {
        if (!repo || !repoList[repo]) {
          throw new Error(`Plugin '${repo}' not found or not loaded`)
        }
        return repoList[repo].methods.downloadChapter?.(data)
      }
    }

    if (Object.values(repoList).length > 0) {
      for (const repo of Object.getOwnPropertyNames(repoList)) {
        const repoProps = Object.getOwnPropertyNames(repoList[repo].methods)
        for (const prop of repoProps) {
          if (!this.properties.includes(prop)) this.properties.push(prop)
        }
      }

      const dynamicMethods = this.properties.reduce((acc, cur) => {
        return {
          ...acc,
          [cur]: async ({ repo, data }) => repoList[repo].methods[cur](data)
        }
      }, {})

      this.methods = { ...commonMethods, ...dynamicMethods }
    } else {
      this.methods = commonMethods
    }
  }
}

export default ApiRepository
