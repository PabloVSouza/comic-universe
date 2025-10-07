import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { updateWindowTitles } from 'functions'
import { useUserSettings } from 'hooks'
import { usePersistStore } from 'store'
import { Item } from 'components/SettingsComponents'
import { Select } from 'components/UiComponents'

const LanguageSettings = () => {
  const { i18n } = useTranslation()
  const { language, setLanguage, _hasHydrated } = usePersistStore()
  const { effectiveLanguage } = useUserSettings()

  useEffect(() => {
    if (effectiveLanguage === language.language && i18n.language !== language.language) {
      i18n.changeLanguage(language.language)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language.language, effectiveLanguage])

  const languageOptions = [
    { value: 'enUS', label: 'English' },
    { value: 'ptBR', label: 'Português' }
  ]

  const handleLanguageChange = async (selected: unknown) => {
    const selectedOption = selected as { value: string; label: string }
    if (selectedOption && selectedOption.value !== language.language) {
      try {
        setLanguage(selectedOption.value)

        setTimeout(() => {
          updateWindowTitles()
        }, 100)
      } catch (error) {
        console.error('Error updating language settings:', error)
      }
    }
  }

  if (!_hasHydrated) {
    return (
      <Item
        labelI18nKey="Settings.general.language.label"
        descriptionI18nKey="Settings.general.language.description"
      >
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </Item>
    )
  }

  return (
    <Item
      labelI18nKey="Settings.general.language.label"
      descriptionI18nKey="Settings.general.language.description"
    >
      <Select
        value={languageOptions.find((option) => option.value === language.language)}
        onChange={handleLanguageChange}
        options={languageOptions}
        className="bg-list-item rounded-lg"
      />
    </Item>
  )
}

export default LanguageSettings
