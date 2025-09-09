import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import useApi from 'api'
import Select from 'components/Select'

interface UpdateSettings {
  autoUpdate: boolean
  optInNonStable: boolean
  releaseTypes: string[]
}

const SettingsUpdatePreferences = () => {
  const { t } = useTranslation()
  const { invoke } = useApi()
  const [settings, setSettings] = useState<UpdateSettings>({
    autoUpdate: true,
    optInNonStable: false,
    releaseTypes: ['stable']
  })
  const [currentVersion, setCurrentVersion] = useState<string>('')

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await invoke('getUpdateSettings')
        setSettings(savedSettings as UpdateSettings)
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }

    const loadCurrentVersion = async () => {
      try {
        const version = await invoke('getAppVersion')
        setCurrentVersion(version as string)
      } catch (error) {
        console.error('Error loading version:', error)
        setCurrentVersion('Unknown')
      }
    }

    loadSettings()
    loadCurrentVersion()
  }, [invoke])

  // Auto-save function
  const autoSave = async (newSettings: UpdateSettings) => {
    try {
      await invoke('updateUpdateSettings', { updateSettings: newSettings })
      console.log('Settings auto-saved')
    } catch (error) {
      console.error('Error auto-saving settings:', error)
    }
  }

  const handleAutoUpdateChange = (checked: boolean) => {
    const newSettings = { ...settings, autoUpdate: checked }
    setSettings(newSettings)
    autoSave(newSettings)
  }

  const handleOptInChange = (checked: boolean) => {
    const newSettings = { ...settings, optInNonStable: checked }
    setSettings(newSettings)
    autoSave(newSettings)
  }

  const handleReleaseTypeChange = (selected: unknown) => {
    const selectedArray = selected as TOption[]
    if (selectedArray) {
      // Extract values from the selected options
      const newReleaseTypes = selectedArray.map(option => option.value)
      const newSettings = {
        ...settings,
        releaseTypes: newReleaseTypes
      }
      setSettings(newSettings)
      autoSave(newSettings)
    }
  }

  const allReleaseTypeOptions = [
    { value: 'stable', label: t('Settings.general.stableReleases') },
    { value: 'beta', label: t('Settings.general.betaReleases') },
    { value: 'alpha', label: t('Settings.general.alphaReleases') }
  ]

  return (
    <div className="space-y-6">
      {/* Current Version Section */}
      <div>
        <label className="block text-base mb-2 text-gray-700 dark:text-gray-300">
          {t('Settings.general.currentVersion')}
        </label>
        <div className="text-base bg-default px-3 py-2 rounded-md">{currentVersion}</div>
      </div>

      {/* Auto-Update Toggle */}
      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings.autoUpdate}
            onChange={(e) => handleAutoUpdateChange(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-base text-gray-700 dark:text-gray-300">
            {t('Settings.general.autoUpdate')}
          </span>
        </label>
      </div>

      {/* Release Types Multi-Select */}
      <div>
        <label className="block text-base mb-2 text-gray-700 dark:text-gray-300">
          {t('Settings.general.releaseTypes')}
        </label>
        <Select
          isMulti
          value={settings.releaseTypes.map(type => 
            allReleaseTypeOptions.find(option => option.value === type)
          ).filter(Boolean)}
          onChange={handleReleaseTypeChange}
          options={allReleaseTypeOptions}
          className="bg-default rounded-lg"
        />
      </div>

      {/* Opt-in for Non-Stable Updates */}
      <div>
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={settings.optInNonStable}
            onChange={(e) => handleOptInChange(e.target.checked)}
            className="w-4 h-4 mt-0.5"
          />
          <div className="space-y-1">
            <span className="text-base text-gray-700 dark:text-gray-300">
              {t('Settings.general.optInNonStable')}
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('Settings.general.optInDescription')}
            </p>
          </div>
        </label>
      </div>
    </div>
  )
}

export default SettingsUpdatePreferences
