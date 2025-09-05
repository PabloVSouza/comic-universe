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
    <div className="grow flex justify-center items-center p-2 flex-col gap-5">
      <h2 className="text-2xl">{lang.Settings.general.updatePreferences}</h2>
      
      {/* Current Version */}
      <div className="w-full max-w-md">
        <label className="block text-sm font-medium mb-2">
          {lang.Settings.general.currentVersion}
        </label>
        <div className="text-sm bg-default px-3 py-2 rounded-md">
          {currentVersion}
        </div>
      </div>

      {/* Auto-Update Toggle */}
      <div className="w-full max-w-md">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings.autoUpdate}
            onChange={(e) => setSettings(prev => ({ ...prev, autoUpdate: e.target.checked }))}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">
            {lang.Settings.general.autoUpdate}
          </span>
        </label>
      </div>

      {/* Release Types Multi-Select */}
      <div className="w-full max-w-md">
        <label className="block text-sm font-medium mb-2">
          {lang.Settings.general.releaseTypes}
        </label>
        <Select
          isMulti
          value={releaseTypeOptions.filter(option => settings.releaseTypes.includes(option.value))}
          onChange={handleReleaseTypeChange}
          options={releaseTypeOptions}
          placeholder="Select release types..."
          className="bg-default rounded-lg"
        />
      </div>

      {/* Opt-in for Non-Stable Updates */}
      <div className="w-full max-w-md">
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={settings.optInNonStable}
            onChange={(e) => setSettings(prev => ({ ...prev, optInNonStable: e.target.checked }))}
            className="w-4 h-4 mt-0.5"
          />
          <div className="space-y-1">
            <span className="text-sm font-medium">
              {lang.Settings.general.optInNonStable}
            </span>
            <p className="text-xs text-gray-500">
              {lang.Settings.general.optInDescription}
            </p>
          </div>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md flex gap-2">
        <Button
          onClick={handleSaveSettings}
          disabled={saveSettings.isPending}
          className="flex-1"
          theme="pure"
        >
          {saveSettings.isPending ? 'Saving...' : lang.Settings.general.saveSettings}
        </Button>

        <Button
          onClick={handleCheckForUpdates}
          disabled={checkForUpdates.isPending}
          className="flex-1"
          theme="pure"
        >
          {checkForUpdates.isPending ? 'Checking...' : lang.Settings.general.checkForUpdates}
        </Button>
      </div>
    </div>
  )
}

export default SettingsGeneral
