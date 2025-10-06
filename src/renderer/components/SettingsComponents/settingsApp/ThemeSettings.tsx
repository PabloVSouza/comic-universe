import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Select } from 'components/ui'
import usePersistStore from 'store/usePersistStore'
import SettingsItem from '../SettingsItem'

const ThemeSettings = () => {
  const { t } = useTranslation()
  const { theme, switchTheme, _hasHydrated } = usePersistStore()
  const [currentTheme, setCurrentTheme] = useState(theme.theme)

  useEffect(() => {
    setCurrentTheme(theme.theme)
  }, [theme])

  const themeOptions = [
    { value: 'dark', label: t('Settings.general.theme.dark') },
    { value: 'light', label: t('Settings.general.theme.light') }
  ]

  const handleThemeChange = (selected: unknown) => {
    const selectedOption = selected as { value: string; label: string }
    setCurrentTheme(selectedOption.value)
    switchTheme(selectedOption.value)
  }

  // Show loading state while store is hydrating
  if (!_hasHydrated) {
    return (
      <SettingsItem
        labelI18nKey="Settings.general.theme.label"
        descriptionI18nKey="Settings.general.theme.description"
      >
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </SettingsItem>
    )
  }

  return (
    <SettingsItem
      labelI18nKey="Settings.general.theme.label"
      descriptionI18nKey="Settings.general.theme.description"
    >
      <Select
        value={themeOptions.find((option) => option.value === currentTheme)}
        onChange={handleThemeChange}
        options={themeOptions}
        className="bg-list-item rounded-lg"
      />
    </SettingsItem>
  )
}

export default ThemeSettings
