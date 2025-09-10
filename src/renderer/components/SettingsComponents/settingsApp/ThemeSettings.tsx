import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import usePersistStore from 'store/usePersistStore'
import Select from 'components/Select'
import SettingsItem from '../SettingsItem'

const ThemeSettings = () => {
  const { t } = useTranslation()
  const { theme, switchTheme } = usePersistStore()
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
