import axios from 'axios'

export class ApiPluginClient implements IRepoPluginRepository {
  public RepoName: string
  public RepoUrl: string
  public RepoTag: string
  public methods: IRepoPluginMethods

  constructor(plugin: IPlugin) {
    this.RepoName = plugin.name
    this.RepoUrl = plugin.url
    this.RepoTag = plugin.tag
    this.methods = this.createApiMethods(plugin.url)
  }

  private createApiMethods(pluginUrl: string): IRepoPluginMethods {
    return {
      getList: async (): Promise<IComic[]> => {
        let lastError: unknown
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const response = await axios.post(
              `${pluginUrl}/getList`,
              {},
              {
                headers: {
                  'Content-Type': 'application/json'
                },
                timeout: 30000
              }
            )
            return response.data
          } catch (error) {
            lastError = error
            if (attempt === 0) {
              await new Promise((resolve) => setTimeout(resolve, 1000))
            }
          }
        }
        console.error(`Error calling getList on plugin ${this.RepoTag}:`, lastError)
        if (axios.isAxiosError(lastError)) {
          throw new Error(`Plugin API error: ${lastError.message}`)
        }
        throw lastError
      },

      search: async (input: { search: string }): Promise<IComic[]> => {
        let lastError: unknown
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const response = await axios.post(`${pluginUrl}/search`, input, {
              headers: {
                'Content-Type': 'application/json'
              },
              timeout: 30000
            })
            return response.data
          } catch (error) {
            lastError = error
            if (attempt === 0) {
              await new Promise((resolve) => setTimeout(resolve, 1000))
            }
          }
        }
        console.error(`Error calling search on plugin ${this.RepoTag}:`, lastError)
        if (axios.isAxiosError(lastError)) {
          throw new Error(`Plugin API error: ${lastError.message}`)
        }
        throw lastError
      },

      getDetails: async (search: { [key: string]: string }): Promise<Partial<IComic>> => {
        try {
          const response = await axios.post(`${pluginUrl}/getDetails`, search, {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 30000
          })
          return response.data
        } catch (error) {
          console.error(`Error calling getDetails on plugin ${this.RepoTag}:`, error)
          if (axios.isAxiosError(error)) {
            throw new Error(`Plugin API error: ${error.message}`)
          }
          throw error
        }
      },

      getChapters: async (input: { siteId: string }): Promise<IChapter[]> => {
        try {
          const response = await axios.post(`${pluginUrl}/getChapters`, input, {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 30000
          })
          return response.data
        } catch (error) {
          console.error(`Error calling getChapters on plugin ${this.RepoTag}:`, error)
          if (axios.isAxiosError(error)) {
            throw new Error(`Plugin API error: ${error.message}`)
          }
          throw error
        }
      },

      getPages: async (input: { siteLink: string }): Promise<IPage[]> => {
        try {
          const response = await axios.post(`${pluginUrl}/getPages`, input, {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 30000
          })
          return response.data
        } catch (error) {
          console.error(`Error calling getPages on plugin ${this.RepoTag}:`, error)
          if (axios.isAxiosError(error)) {
            throw new Error(`Plugin API error: ${error.message}`)
          }
          throw error
        }
      },

      downloadChapter: async (input: {
        comic: IComic
        chapter: IChapter
      }): Promise<{ cover: string; pageFiles: IPage[] }> => {
        try {
          const response = await axios.post(`${pluginUrl}/downloadChapter`, input, {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 60000
          })
          return response.data
        } catch (error) {
          console.error(`Error calling downloadChapter on plugin ${this.RepoTag}:`, error)
          if (axios.isAxiosError(error)) {
            throw new Error(`Plugin API error: ${error.message}`)
          }
          throw error
        }
      }
    }
  }
}
