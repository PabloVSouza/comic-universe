import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import usePersistStore from 'store/usePersistStore'
import Select from 'components/Select'
import SettingsItem from '../SettingsItem'
import { updateWindowTitles } from 'functions/openWindow'

const LanguageSettings = () => {
  const { i18n } = useTranslation()
  const { language, setLanguage } = usePersistStore()

  // Update i18n when language changes
  useEffect(() => {
    if (i18n.language !== language.language) {
      i18n.changeLanguage(language.language)
    }
  }, [language, i18n])

  const languageOptions = [
    { value: 'enUS', label: 'English' },
    { value: 'ptBR', label: 'Português' }
  ]

  const handleLanguageChange = async (selected: unknown) => {
    const selectedOption = selected as { value: string; label: string }
    if (selectedOption && selectedOption.value !== language.language) {
      try {
        // Update store (which will save to settings.json)
        setLanguage(selectedOption.value)

        // Update window titles to reflect language change
        // Small delay to ensure i18n has updated
        setTimeout(() => {
          updateWindowTitles()
        }, 100)
      } catch (error) {
        console.error('Error updating language settings:', error)
      }
    }
  }

  return (
    <SettingsItem
      labelI18nKey="Settings.general.language.label"
      descriptionI18nKey="Settings.general.language.description"
    >
      <Select
        value={languageOptions.find((option) => option.value === language.language)}
        onChange={handleLanguageChange}
        options={languageOptions}
        className="bg-list-item rounded-lg"
      />
    </SettingsItem>
  )
}

export default LanguageSettings
