import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import fs from 'fs'
import path from 'path'
import { NeDBDBInteractionsRepository } from '../repositories/Implementations/DBInteractions/NeDBDBInteractionsRepository'

const packageJson = String(fs.readFileSync(__dirname + '/../../package.json'))
const { version, description, repository, license, author } = JSON.parse(packageJson)

const api = {}

const app = { version, description, repository, license, author, path }

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('Electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('path', path)
    contextBridge.exposeInMainWorld('app', app)
    contextBridge.exposeInMainWorld('db', NeDBDBInteractionsRepository)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.Electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.app = app
  // @ts-ignore (define in dts)
  window.path = path
  // @ts-ignore (define in dts)
  window.db = NeDBDBInteractionsRepository
}
