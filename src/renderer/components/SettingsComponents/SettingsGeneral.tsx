import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import useLang from 'lang'
import useApi from 'api'
import Button from 'components/Button'
import Select from 'components/Select'

interface UpdateSettings {
  autoUpdate: boolean
  optInNonStable: boolean
  releaseTypes: string[]
}

const SettingsGeneral = () => {
  const lang = useLang()
  const { invoke } = useApi()
  const [settings, setSettings] = useState<UpdateSettings>({
    autoUpdate: true,
    optInNonStable: false,
    releaseTypes: ['stable']
  })
  const [currentVersion, setCurrentVersion] = useState<string>('')

  // Load current settings and version on mount
  useEffect(() => {
    loadSettings()
    loadCurrentVersion()
  }, [])

  const loadSettings = async () => {
    try {
      // Load settings from file
      const savedSettings = await invoke('getUpdateSettings')
      setSettings(savedSettings)
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const loadCurrentVersion = async () => {
    try {
      const version = await invoke('getAppVersion')
      setCurrentVersion(version)
    } catch (error) {
      console.error('Error loading version:', error)
      setCurrentVersion('Unknown')
    }
  }

  const saveSettings = useMutation({
    mutationFn: async (newSettings: UpdateSettings) => {
      return await invoke('updateUpdateSettings', { updateSettings: newSettings })
    },
    onSuccess: () => {
      // Show success message
      console.log(lang.Settings.general.settingsSaved)
    }
  })

  const checkForUpdates = useMutation({
    mutationFn: async () => {
      return await invoke('checkForUpdates')
    },
    onSuccess: (result) => {
      console.log(lang.Settings.general.updateCheckSuccess, result)
    },
    onError: (error) => {
      console.error(lang.Settings.general.updateCheckError, error)
    }
  })

  const handleSaveSettings = () => {
    saveSettings.mutate(settings)
  }

  const handleCheckForUpdates = () => {
    checkForUpdates.mutate()
  }

  const handleReleaseTypeChange = (selected: any) => {
    const selectedTypes = selected ? selected.map((item: any) => item.value) : []
    setSettings(prev => ({
      ...prev,
      releaseTypes: selectedTypes
    }))
  }

  const releaseTypeOptions = [
    { value: 'stable', label: lang.Settings.general.stableReleases },
    { value: 'beta', label: lang.Settings.general.betaReleases },
    { value: 'alpha', label: lang.Settings.general.alphaReleases },
    { value: 'nightly', label: lang.Settings.general.nightlyReleases }
  ]

  return (
    <div className="flex grow flex-col p-6 space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          {lang.Settings.general.updatePreferences}
        </h2>

        {/* Current Version */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {lang.Settings.general.currentVersion}
          </label>
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-md">
            {currentVersion}
          </div>
        </div>

        {/* Auto-Update Toggle */}
        <div className="space-y-2">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.autoUpdate}
              onChange={(e) => setSettings(prev => ({ ...prev, autoUpdate: e.target.checked }))}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {lang.Settings.general.autoUpdate}
            </span>
          </label>
        </div>

        {/* Release Types Multi-Select */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {lang.Settings.general.releaseTypes}
          </label>
          <Select
            isMulti
            value={releaseTypeOptions.filter(option => settings.releaseTypes.includes(option.value))}
            onChange={handleReleaseTypeChange}
            options={releaseTypeOptions}
            placeholder="Select release types..."
            className="text-sm"
          />
        </div>

        {/* Opt-in for Non-Stable Updates */}
        <div className="space-y-2">
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={settings.optInNonStable}
              onChange={(e) => setSettings(prev => ({ ...prev, optInNonStable: e.target.checked }))}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mt-0.5"
            />
            <div className="space-y-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {lang.Settings.general.optInNonStable}
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {lang.Settings.general.optInDescription}
              </p>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button
            onClick={handleSaveSettings}
            disabled={saveSettings.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saveSettings.isPending ? 'Saving...' : lang.Settings.general.saveSettings}
          </Button>
          
          <Button
            onClick={handleCheckForUpdates}
            disabled={checkForUpdates.isPending}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {checkForUpdates.isPending ? 'Checking...' : lang.Settings.general.checkForUpdates}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SettingsGeneral
