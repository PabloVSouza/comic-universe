import { BrowserWindow, ipcMain } from 'electron'

import appEvents from './appEvents'
import apiEvents from './apiEvents'
import dbEvents from './dbEvents'
import pluginEvents from './pluginEvents'

import type { Startup } from '../Scripts/Startup'

export const createEvents = (window: BrowserWindow, startupObject: Startup, path: string): void => {
  appEvents(window, startupObject, path)
  apiEvents(window, startupObject, path)
  dbEvents(window, startupObject, path)
  pluginEvents(window, startupObject, path)
}

export const removeEvents = (): void => {
  // @ts-ignore typing not defined by electron
  const events = Array.from(ipcMain._invokeHandlers.keys()) as string[]
  for (const event of events) {
    ipcMain.removeHandler(event)
  }
}
