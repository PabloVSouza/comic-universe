import { BrowserWindow, ipcMain } from 'electron'

import appEvents from './appEvents'
import apiEvents from './apiEvents'
import dbEvents from './dbEvents'

export const createEvents = (window: BrowserWindow, path: string): void => {
  appEvents(window, path)
  apiEvents(window, path)
  dbEvents(window, path)
}

export const removeEvents = (): void => {
  // @ts-ignore (define in dts)
  const events = Array.from(ipcMain._invokeHandlers.keys()) as string[]
  for (const event of events) {
    ipcMain.removeHandler(event)
  }
}
