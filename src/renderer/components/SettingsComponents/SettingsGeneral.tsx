import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import SettingsUpdatePreferences from './SettingsUpdatePreferences'
import useApi from 'api'
import Select from 'components/Select'
import Button from 'components/Button'
import refreshIcon from 'assets/refresh.svg'
import { updateWindowTitles } from 'functions/openWindow'

const SettingsGeneral = () => {
  const { t, i18n } = useTranslation()
  const { invoke } = useApi()
  const [currentLanguage, setCurrentLanguage] = useState('ptBR')

  // Load language from settings on component mount
  useEffect(() => {
    loadLanguageFromSettings()
  }, [])

  const loadLanguageFromSettings = async () => {
    try {
      const languageSettings = await invoke('getLanguageSettings')
      const language = languageSettings?.language || 'ptBR'
      setCurrentLanguage(language)

      // Update i18n if different
      if (i18n.language !== language) {
        await i18n.changeLanguage(language)
      }
    } catch (error) {
      console.error('Error loading language settings:', error)
    }
  }

  const languageOptions = [
    { value: 'enUS', label: 'English' },
    { value: 'ptBR', label: 'Português' }
  ]

  const handleLanguageChange = async (selected: any) => {
    if (selected && selected.value !== currentLanguage) {
      console.log('Changing language from', currentLanguage, 'to:', selected.value)

      try {
        // Update settings file
        await invoke('updateLanguageSettings', { languageSettings: { language: selected.value } })

        // Update local state
        setCurrentLanguage(selected.value)

        // Update i18n
        await i18n.changeLanguage(selected.value)

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

  const checkForUpdates = useMutation({
    mutationFn: async () => {
      return await invoke('checkForUpdates')
    },
    onSuccess: (data) => {
      console.log('Update check result:', data)
    },
    onError: (error) => {
      console.error('Error checking for updates:', error)
    }
  })

  const handleCheckForUpdates = () => {
    checkForUpdates.mutate()
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4">
        <h2 className="text-2xl text-center">{t('Settings.general.title')}</h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-md mx-auto space-y-8">
          {/* Language Selection Section */}
          <div>
            <h3 className="text-xl mb-4 text-gray-800 dark:text-gray-200">
              {t('Settings.general.language')}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-base mb-2 text-gray-700 dark:text-gray-300">
                  {t('Settings.general.selectLanguage')}
                </label>
                <Select
                  value={languageOptions.find((option) => option.value === currentLanguage)}
                  onChange={handleLanguageChange}
                  options={languageOptions}
                  className="bg-default rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          {/* Update Preferences Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl text-gray-800 dark:text-gray-200">
                {t('Settings.general.updatePreferences')}
              </h3>
              <Button
                onClick={handleCheckForUpdates}
                disabled={checkForUpdates.isPending}
                loading={checkForUpdates.isPending}
                icon={refreshIcon}
                size="icon"
                theme="pure"
                title={
                  checkForUpdates.isPending
                    ? t('General.checking')
                    : t('Settings.general.checkForUpdates')
                }
              />
            </div>
            <SettingsUpdatePreferences />
          </div>

          {/* Future sections can be added here */}
          {/* 
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Other General Settings
            </h3>
            <div className="space-y-4">
              // Other settings components can be added here
            </div>
          </div>
          */}
        </div>
      </div>
    </div>
  )
}

export default SettingsGeneral
