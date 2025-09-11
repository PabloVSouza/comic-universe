import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import usePersistStore from 'store/usePersistStore'
import { useUserSettings } from 'hooks/useUserSettings'
import Select from 'components/Select'
import SettingsItem from '../SettingsItem'
import { updateWindowTitles } from 'functions/openWindow'

const LanguageSettings = () => {
  const { i18n } = useTranslation()
  const { language, setLanguage, _hasHydrated } = usePersistStore()
  const { effectiveLanguage } = useUserSettings()

  // Update i18n when language changes, but only if user doesn't have a language override
  useEffect(() => {
    // Only apply app-level language if user language is set to 'inherit'
    if (effectiveLanguage === language.language && i18n.language !== language.language) {
      i18n.changeLanguage(language.language)
    }
  }, [language, i18n, effectiveLanguage])

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

  // Show loading state while store is hydrating
  if (!_hasHydrated) {
    return (
      <SettingsItem
        labelI18nKey="Settings.general.language.label"
        descriptionI18nKey="Settings.general.language.description"
      >
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </SettingsItem>
    )
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
