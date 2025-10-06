import { initReactI18next } from 'react-i18next'
import i18n from 'i18next'
import enUS from './enUS.json'
import ptBR from './ptBR.json'

const resources = {
  enUS: { translation: enUS },
  ptBR: { translation: ptBR }
}

void i18n.use(initReactI18next).init({
  resources,
  lng: 'ptBR',
  fallbackLng: 'ptBR',
  supportedLngs: ['enUS', 'ptBR'],
  interpolation: { escapeValue: false }
})

export const loadLanguageFromSettings = async (): Promise<void> => {
  try {
    const defaultLanguage = 'ptBR'
    if (i18n.language !== defaultLanguage) {
      await i18n.changeLanguage(defaultLanguage)
    }
  } catch (error) {
    console.error('Error loading language from settings:', error)
  }
}

export default i18n
