// API Types for the application
export interface AppData {
  version: string
  description: string
  repository: string
  license: string
  author: string
  name: string
}

export interface AppParams {
  appRunningPath: string
  appPath: string
  isDev: boolean
}

export interface UpdateSettings {
  autoUpdate: boolean
  optInNonStable: boolean
  releaseTypes: string[]
}

export interface LanguageSettings {
  language: string
}

export interface DebugSettings {
  enableDebugLogging: boolean
}

export interface WebUISettings {
  enableWebUI: boolean
}

export interface AppSettings {
  update: UpdateSettings
  language: LanguageSettings
  debug: DebugSettings
  webUI: WebUISettings
}

// Main API interface
export interface ComicUniverseAPI {
  // App methods
  getAppData: () => AppData
  path: (args: string[]) => string
  getAppParams: () => AppParams
  maximizeWindow: () => void
  closeWindow: () => void
  minimizeWindow: () => void
  openWindow: (args: { window: string; data?: any }) => void
  openExternal: (args: { url: string }) => void

  // Settings methods
  loadSettings: () => Promise<AppSettings>
  updateSettings: (key: string, value: any) => Promise<AppSettings>
  getUpdateSettings: () => Promise<UpdateSettings>
  updateUpdateSettings: (settings: Partial<UpdateSettings>) => Promise<UpdateSettings>
  getLanguageSettings: () => Promise<LanguageSettings>
  updateLanguageSettings: (settings: Partial<LanguageSettings>) => Promise<LanguageSettings>
  getDebugSettings: () => Promise<DebugSettings>
  updateDebugSettings: (settings: Partial<DebugSettings>) => Promise<DebugSettings>
  getWebUISettings: () => Promise<WebUISettings>
  updateWebUISettings: (settings: Partial<WebUISettings>) => Promise<WebUISettings>

  // Database methods
  dbRunMigrations: () => Promise<void>
  dbVerifyMigrations: () => Promise<boolean>
  dbGetComic: (args: { id: string }) => Promise<IComic>
  dbGetComics: () => Promise<IComic[]>
  dbInsertComic: (args: { comic: IComic; chapters: IChapter[]; repo: string }) => Promise<void>
  dbUpdateComic: (args: { id: string; comic: Partial<IComic> }) => Promise<void>
  dbDeleteComic: (args: { id: string }) => Promise<void>
  dbGetChapters: (args: { comicId: string }) => Promise<IChapter[]>
  dbInsertChapter: (args: { chapter: IChapter; pages: IPage[] }) => Promise<void>
  dbUpdateChapter: (args: { id: string; chapter: Partial<IChapter> }) => Promise<void>
  dbDeleteChapter: (args: { id: string }) => Promise<void>
  dbGetPages: (args: { chapterId: string }) => Promise<IPage[]>
  dbInsertPage: (args: { page: IPage }) => Promise<void>
  dbUpdatePage: (args: { id: string; page: Partial<IPage> }) => Promise<void>
  dbDeletePage: (args: { id: string }) => Promise<void>
  dbGetReadProgress: (args: { chapterId: string }) => Promise<IReadProgress[]>
  dbGetReadProgressByUser: (args: { userId: number }) => Promise<IReadProgress[]>
  dbInsertReadProgress: (args: { readProgress: IReadProgress }) => Promise<void>
  dbUpdateReadProgress: (args: {
    id: string
    readProgress: Partial<IReadProgress>
  }) => Promise<void>
  dbDeleteReadProgress: (args: { id: string }) => Promise<void>
  dbGetUsers: () => Promise<IUser[]>
  dbInsertUser: (args: { user: IUser }) => Promise<void>
  dbUpdateUser: (args: { id: string; user: Partial<IUser> }) => Promise<void>
  dbDeleteUser: (args: { id: string }) => Promise<void>
  dbGetUserSettings: (args: { userId: number }) => Promise<IUserSettings | undefined>
  dbUpdateUserSettings: (args: {
    userId: number
    settings: Partial<IUserSettings>
  }) => Promise<IUserSettings | undefined>

  // Plugin methods (dynamic based on installed plugins)
  [key: string]: any

  // API server methods
  restartApiServer: () => Promise<{ message: string }>
}

// IPC Implementation interface
export interface IpcImplementation {
  invoke: (method: string, args?: any) => Promise<any>
  on: (channel: string, callback: (...args: any[]) => void) => void
  removeAllListeners: (channel: string) => void
}

// REST Implementation interface
export interface RestImplementation {
  invoke: (method: string, args?: any) => Promise<any>
}
