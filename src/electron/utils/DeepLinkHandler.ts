import { app, BrowserWindow, ipcMain } from 'electron'

export interface DeepLinkData {
  action: string
  type?: string // 'plugin' | 'comic' | 'chapter' | etc
  url?: string
  name?: string
  id?: string
  data?: Record<string, unknown>
}

export class DeepLinkHandler {
  private static instance: DeepLinkHandler
  private mainWindow: BrowserWindow | null = null

  // Singleton pattern - no direct instantiation
  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): DeepLinkHandler {
    if (!DeepLinkHandler.instance) {
      DeepLinkHandler.instance = new DeepLinkHandler()
    }
    return DeepLinkHandler.instance
  }

  /**
   * Initialize deep link handling for comic-universe:// protocol
   */
  setupProtocolHandler(mainWindow: BrowserWindow): void {
    this.mainWindow = mainWindow

    // Set up protocol handler for comic-universe:// URLs
    if (process.defaultApp) {
      if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('comic-universe', process.execPath, [process.argv[1]])
      }
    } else {
      app.setAsDefaultProtocolClient('comic-universe')
    }

    // Handle URLs opened with comic-universe:// protocol
    app.on('open-url', (event, url) => {
      event.preventDefault()
      this.handleDeepLink(url)
    })

    // Windows: Handle via second-instance event
    app.on('second-instance', (_event, argv) => {
      const deepLinkUrl = argv.find((arg) => arg.startsWith('comic-universe://'))
      if (deepLinkUrl) {
        this.handleDeepLink(deepLinkUrl)
      }
    })
  }

  private handleDeepLink(url: string): void {
    console.log('Deep link received:', url)

    try {
      const parsedData = this.parseDeepLink(url)
      console.log('Parsed deep link data:', parsedData)

      const sendToRenderer = () => {
        let targetWindow: BrowserWindow | null = null

        if (this.mainWindow && this.mainWindow.webContents) {
          try {
            if (!this.mainWindow.isDestroyed()) {
              targetWindow = this.mainWindow
            }
          } catch {
          }
        }

        if (!targetWindow) {
          const windows = BrowserWindow.getAllWindows()
          if (windows.length > 0 && windows[0].webContents) {
            try {
              if (!windows[0].isDestroyed()) {
                targetWindow = windows[0]
              }
            } catch {
            }
          }
        }

        if (targetWindow && targetWindow.webContents) {
          targetWindow.webContents.send('deep-link-received', parsedData)
        } else {
          setTimeout(sendToRenderer, 500)
        }
      }

      sendToRenderer()
    } catch (error) {
      console.error('Error handling deep link:', error)
    }
  }

  /**
   * Parse comic-universe:// URL format
   * Examples:
   * - comic-universe://plugin/install?url=https://example.com&name=PluginName
   * - comic-universe://comic/open?id=123
   * - comic-universe://chapter/add?comicId=123&chapterId=456
   */
  private parseDeepLink(url: string): DeepLinkData {
    const match = url.match(/^comic-universe:\/\/([^/?]+)\/([^/?]+)(?:\?(.*))?$/)

    if (!match) {
      throw new Error(`Invalid comic-universe URL format: ${url}`)
    }

    const [, type, action, queryString] = match

    // Parse query parameters
    const params = new URLSearchParams(queryString || '')
    const data: DeepLinkData = {
      action,
      type
    }

    // Extract common parameters
    if (params.has('url')) data.url = params.get('url') || undefined
    if (params.has('name')) data.name = params.get('name') || undefined
    if (params.has('id')) data.id = params.get('id') || undefined

    // Add all other params to data object
    const additionalData: Record<string, string> = {}
    params.forEach((value, key) => {
      if (!['url', 'name', 'id'].includes(key)) {
        additionalData[key] = value
      }
    })

    if (Object.keys(additionalData).length > 0) {
      data.data = additionalData
    }

    return data
  }

  /**
   * Register IPC handler for when renderer is ready to receive deep links
   */
  setupIpcHandler(): void {
    ipcMain.on('deep-link-ready', () => {
      console.log('Renderer ready for deep links')
      // You can cache any pending deep links and send them here if needed
    })
  }

  /**
   * Send a deep link to the renderer (useful for testing or queued links)
   */
  sendDeepLink(data: DeepLinkData): void {
    if (this.mainWindow && this.mainWindow.webContents) {
      try {
        if (!this.mainWindow.isDestroyed()) {
          this.mainWindow.webContents.send('deep-link-received', data)
        }
      } catch {
      }
    }
  }
}

export default DeepLinkHandler.getInstance()
