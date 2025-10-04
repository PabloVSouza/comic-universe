import { initReactI18next } from 'react-i18next'
import i18n from 'i18next'
import enUS from './enUS.json'
import ptBR from './ptBR.json'

const resources = {
  enUS: { translation: enUS },
  ptBR: { translation: ptBR }
}

// Initialize i18n without language detection
// Language will be set from settings file
void i18n.use(initReactI18next).init({
  resources,
  lng: 'ptBR', // Default language, will be overridden by settings
  fallbackLng: 'ptBR',
  supportedLngs: ['enUS', 'ptBR'],
  interpolation: { escapeValue: false }
})

// Function to load language from settings and apply it
export const loadLanguageFromSettings = async (): Promise<void> => {
  try {
    // This will be called from the main process via IPC
    // For now, we'll use the default language
    const defaultLanguage = 'ptBR'
    if (i18n.language !== defaultLanguage) {
      await i18n.changeLanguage(defaultLanguage)
    }
  } catch (error) {
    console.error('Error loading language from settings:', error)
  }
}

export default i18n
