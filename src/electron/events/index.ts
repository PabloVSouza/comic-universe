import { BrowserWindow } from 'electron'

import appEvents from './appEvents'
import apiEvents from './apiEvents'
import dbEvents from './dbEvents'

const Events = (window: BrowserWindow): void => {
  appEvents(window)
  apiEvents(window)
  dbEvents(window)
}

export default Events
