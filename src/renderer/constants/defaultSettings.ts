export const DEFAULT_SETTINGS = {
  theme: { theme: 'dark' },
  repo: { repo: { value: '', label: '' } },
  language: { language: 'ptBR' },
  debug: { enableDebugLogging: false },
  webUI: { enableWebUI: false }
} as const

export const DEFAULT_UPDATE_SETTINGS = {
  update: {
    autoUpdate: false,
    optInNonStable: false
  }
} as const
