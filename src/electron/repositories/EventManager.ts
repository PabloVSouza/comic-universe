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

  listEvents(): string[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const events = Array.from((ipcMain as any)._invokeHandlers.keys()) as string[]
    return events
  }

  public removeEvents = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const events = Array.from((ipcMain as any)._invokeHandlers.keys()) as string[]
    for (const event of events) {
      ipcMain.removeHandler(event)
    }
  }

  public resetEvents = () => {
    this.removeEvents()
    this.startEvents()
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  public updateMethods = (newMethods: Record<string, Function>) => {
    this.methods = newMethods
    this.resetEvents()
  }
}

export default EventManager
