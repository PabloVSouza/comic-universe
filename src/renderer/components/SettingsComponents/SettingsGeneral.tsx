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
  const [debugLoggingEnabled, setDebugLoggingEnabled] = useState(false)
  const [webUIEnabled, setWebUIEnabled] = useState(false)

  // Load settings on component mount
  useEffect(() => {
    loadLanguageFromSettings()
    loadDebugSettings()
    loadWebUISettings()
  }, [])

  const loadLanguageFromSettings = async () => {
    try {
      const languageSettings = await invoke('getLanguageSettings') as { language?: string }
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

  const loadDebugSettings = async () => {
    try {
      const debugSettings = await invoke('getDebugSettings') as { enableDebugLogging?: boolean }
      const enabled = debugSettings?.enableDebugLogging || false
      setDebugLoggingEnabled(enabled)
    } catch (error) {
      console.error('Error loading debug settings:', error)
    }
  }

  const loadWebUISettings = async () => {
    try {
      const webUISettings = await invoke('getWebUISettings') as { enableWebUI?: boolean }
      const enabled = webUISettings?.enableWebUI || false
      setWebUIEnabled(enabled)
    } catch (error) {
      console.error('Error loading web UI settings:', error)
    }
  }

  const languageOptions = [
    { value: 'enUS', label: 'English' },
    { value: 'ptBR', label: 'Português' }
  ]

  const handleLanguageChange = async (selected: unknown) => {
    const selectedOption = selected as { value: string; label: string }
    if (selectedOption && selectedOption.value !== currentLanguage) {
      console.log('Changing language from', currentLanguage, 'to:', selectedOption.value)

      try {
        // Update settings file
        await invoke('updateLanguageSettings', {
          languageSettings: { language: selectedOption.value }
        })

        // Update local state
        setCurrentLanguage(selectedOption.value)

        // Update i18n
        await i18n.changeLanguage(selectedOption.value)

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

  const handleDebugLoggingToggle = async () => {
    try {
      const newValue = !debugLoggingEnabled
      await invoke('updateDebugSettings', {
        debugSettings: { enableDebugLogging: newValue }
      })
      setDebugLoggingEnabled(newValue)
    } catch (error) {
      console.error('Error updating debug settings:', error)
    }
  }

  const handleWebUIToggle = async () => {
    try {
      const newValue = !webUIEnabled
      await invoke('updateWebUISettings', {
        webUISettings: { enableWebUI: newValue }
      })
      setWebUIEnabled(newValue)
    } catch (error) {
      console.error('Error updating web UI settings:', error)
    }
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

          {/* Debug Settings Section */}
          <div>
            <h3 className="text-xl mb-4 text-gray-800 dark:text-gray-200">Debug Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-base text-gray-700 dark:text-gray-300">
                    Enable Debug Logging
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Show detailed debug information in the console
                  </p>
                </div>
                <button
                  onClick={handleDebugLoggingToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    debugLoggingEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      debugLoggingEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          {/* Web UI Settings Section */}
          <div>
            <h3 className="text-xl mb-4 text-gray-800 dark:text-gray-200">Web Interface</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-base text-gray-700 dark:text-gray-300">
                    Enable Web UI
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Allow access to the application through a web browser interface
                  </p>
                </div>
                <button
                  onClick={handleWebUIToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    webUIEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      webUIEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
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
