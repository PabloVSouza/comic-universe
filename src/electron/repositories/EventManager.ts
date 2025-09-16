import { ipcMain } from 'electron'

class EventManager {
  constructor(private methods) {
    this.startEvents()
  }

  public startEvents = () => {
    const properties = Object.getOwnPropertyNames(this.methods)

    for (const method of properties) {
      ipcMain.handle(method, async (_event, data) => this.methods[method](data))
    }

    ipcMain.handle('resetEvents', () => {
      this.resetEvents()
    })
  }

  public removeEvents = () => {
    // @ts-ignore typing not defined by electron
    const events = Array.from(ipcMain._invokeHandlers.keys()) as string[]
    for (const event of events) {
      ipcMain.removeHandler(event)
    }
  }

  public resetEvents = () => {
    this.removeEvents()
    this.startEvents()
  }

  public updateMethods = (newMethods: any) => {
    this.methods = newMethods
    this.resetEvents()
  }
}

export default EventManager
