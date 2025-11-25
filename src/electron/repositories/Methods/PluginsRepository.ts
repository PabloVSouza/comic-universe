import axios from 'axios'
import { BrowserWindow } from 'electron'
import { getApiBaseUrl } from 'shared/constants'
import { getDatabase } from '../database'
import { ApiPluginClient } from './ApiPluginClient'

class PluginsRepository {
  public activePlugins = {} as { [key: string]: IRepoPluginRepository }

  public startUp = async () => {
    try {
      const db = getDatabase()
      let targetUser = await db.getDefaultUser()
      if (!targetUser) {
        const allUsers = await db.getAllUsers()
        if (allUsers.length > 0) {
          targetUser = allUsers[0]
        }
      }
      if (targetUser?.id) {
        await this.methods.activatePlugins({ userId: targetUser.id })
      }
    } catch (error) {
      console.error('Error in plugins startup:', error)
    }
  }

  public methods = {
    activatePlugins: async ({ userId }: { userId: string }) => {
      this.activePlugins = {}

      try {
        const db = getDatabase()
        const enabledPlugins = await db.getEnabledPlugins(userId)
        for (const plugin of enabledPlugins) {
          try {
            const apiPlugin = new ApiPluginClient(plugin)
            this.activePlugins = {
              ...this.activePlugins,
              [apiPlugin.RepoTag]: apiPlugin
            }
          } catch (error) {
            console.error(`Failed to activate plugin ${plugin.name}:`, error)
          }
        }
        const win = BrowserWindow.getAllWindows()[0]
        if (win) win.webContents.send('updateRepos')
      } catch (error) {
        console.error('Error loading plugins from database:', error)
      }
    },

    getAllPlugins: async ({ userId }: { userId: string }) => {
      try {
        const db = getDatabase()
        return await db.getAllPlugins(userId)
      } catch (error) {
        console.error('Error getting all plugins:', error)
        return []
      }
    },

    getPluginById: async ({ id, userId }: { id: number; userId: string }) => {
      try {
        const db = getDatabase()
        return await db.getPluginById(id, userId)
      } catch (error) {
        console.error('Error getting plugin by id:', error)
        return undefined
      }
    },

    createPlugin: async ({
      plugin,
      userId
    }: {
      plugin: Omit<IPlugin, 'id' | 'userId'>
      userId: string
    }) => {
      try {
        const db = getDatabase()
        const pluginWithUserId = { ...plugin, userId } as IPlugin
        const created = await db.createPlugin(pluginWithUserId)

        await db.createChangelogEntry({
          userId,
          entityType: 'userPlugin',
          entityId: String(created.id),
          action: 'created',
          data: created,
          synced: false
        })

        return created
      } catch (error) {
        console.error('Error creating plugin:', error)
        throw error
      }
    },

    updatePlugin: async ({
      id,
      plugin,
      userId
    }: {
      id: number
      plugin: Partial<IPlugin>
      userId: string
    }) => {
      try {
        const db = getDatabase()
        const updated = await db.updatePlugin(id, plugin, userId)
        if (updated) {
          await this.methods.activatePlugins({ userId })

          await db.createChangelogEntry({
            userId,
            entityType: 'userPlugin',
            entityId: String(id),
            action: 'updated',
            data: updated,
            synced: false
          })
        }
        return updated
      } catch (error) {
        console.error('Error updating plugin:', error)
        throw error
      }
    },

    deletePlugin: async ({ id, userId }: { id: number; userId: string }) => {
      try {
        const db = getDatabase()
        const plugin = await db.getPluginById(id, userId)
        await db.deletePlugin(id, userId)
        await this.methods.activatePlugins({ userId })

        if (plugin) {
          await db.createChangelogEntry({
            userId,
            entityType: 'userPlugin',
            entityId: String(id),
            action: 'deleted',
            data: plugin,
            synced: false
          })
        }
      } catch (error) {
        console.error('Error deleting plugin:', error)
        throw error
      }
    },

    getRepoList: async () => {
      return Object.values(this.activePlugins).map((plugin) => ({
        label: plugin.RepoName,
        value: plugin.RepoTag
      }))
    },

    getPluginInfoList: async ({ userId }: { userId: string }) => {
      try {
        const db = getDatabase()
        const plugins = await db.getAllPlugins(userId)
        return plugins.map((plugin) => ({
          name: plugin.name,
          author: 'Unknown',
          repository: plugin.url,
          path: '',
          iconPath: plugin.logo || '',
          version: 'API'
        })) as IRepoPluginInfo[]
      } catch (error) {
        console.error('Error getting plugin info list:', error)
        return []
      }
    },

    getPluginsFromApi: async () => {
      try {
        const baseUrl = getApiBaseUrl(process.env.NODE_ENV === 'development')
        const response = await axios.get(`${baseUrl}/api/plugins`, {
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (response.data.success && Array.isArray(response.data.data)) {
          return response.data.data.map(
            (plugin: {
              name: string
              apiUrl: string
              tags?: string | null
              description?: string | null
              logoUrl?: string | null
              version?: string | null
              author?: string | null
              website?: string | null
            }) => {
              const tags = plugin.tags
                ? typeof plugin.tags === 'string'
                  ? JSON.parse(plugin.tags)
                  : plugin.tags
                : []
              const tag =
                Array.isArray(tags) && tags.length > 0
                  ? tags[0]
                  : plugin.name.toLowerCase().replace(/\s+/g, '-')

              return {
                name: plugin.name,
                repo: plugin.apiUrl,
                tag: tag,
                description: plugin.description || undefined,
                logoUrl: plugin.logoUrl || undefined,
                version: plugin.version || undefined,
                author: plugin.author || undefined,
                website: plugin.website || undefined
              } as IRepoApiPluginList
            }
          )
        }

        return []
      } catch (error) {
        console.error('Error fetching plugins from API:', error)
        if (axios.isAxiosError(error) && error.response) {
          console.error('API response error:', error.response.status, error.response.data)
        }
        return []
      }
    }
  }
}

export default PluginsRepository
