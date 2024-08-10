import { BrowserWindow, ipcMain } from 'electron'

import appEvents from './appEvents'
import apiEvents from './apiEvents'
import dbEvents from './dbEvents'
import pluginEvents from './pluginEvents'

import type { Startup } from '../Scripts/Startup'
class EventManager {
  constructor(
    private startupObject: Startup,
    private path: string,
    private win: BrowserWindow
  ) {
    this.startEvents()
  }

  public startEvents = () => {
    appEvents(this.startupObject, this.path, this.win)
    apiEvents(this.startupObject, this.path, this.win)
    dbEvents(this.startupObject, this.path, this.win)
    pluginEvents(this.startupObject, this.path, this.win)
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
}

export default EventManager
