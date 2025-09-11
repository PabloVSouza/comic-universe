import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import usePersistStore from 'store/usePersistStore'
import useApi from 'api'
import useEnvironment from 'hooks/useEnvironment'
import Button from 'components/Button'
import SettingsItem from '../SettingsItem'

const SettingsWebUIPreferences = () => {
  const { t } = useTranslation()
  const { invoke } = useApi()
  const { webUI, setWebUI, setWebUIAutoPort, setWebUIPort, _hasHydrated } = usePersistStore()
  const { shouldDisableWebUISettings } = useEnvironment()
  const [currentWebUI, setCurrentWebUI] = useState(webUI.enableWebUI)
  const [webUIPort, setWebUIPortInput] = useState<string>('8080')
  const [webUIStatus, setWebUIStatus] = useState<'running' | 'stopped' | 'unknown'>('unknown')
  const [actualPort, setActualPort] = useState<number | null>(null)
  const [autoPort, setAutoPort] = useState<boolean>(true)

  useEffect(() => {
    setCurrentWebUI(webUI.enableWebUI)
    // Load auto port setting from store if available
    if (webUI.autoPort !== undefined) {
      setAutoPort(webUI.autoPort)
    }
    // Load port setting from store if available
    if (webUI.port !== undefined) {
      setWebUIPortInput(webUI.port.toString())
    }
  }, [webUI])

  // Load Web UI status and port
  useEffect(() => {
    const loadWebUIStatus = async () => {
      try {
        setWebUIStatus(currentWebUI ? 'running' : 'stopped')

        // Load the actual port from the server
        if (currentWebUI) {
          const portResult = await invoke('getWebUIPort')
          if (portResult && portResult.port) {
            setActualPort(portResult.port)
            // Update the input field to show the actual port if no manual port is set
            if (!webUI.port) {
              setWebUIPortInput(portResult.port.toString())
            }
          }
        }
      } catch (error) {
        setWebUIStatus('unknown')
      }
    }

    loadWebUIStatus()
  }, [currentWebUI, invoke])

  const handleWebUIToggle = async () => {
    const newValue = !currentWebUI
    setCurrentWebUI(newValue)
    setWebUI(newValue)

    // Trigger API server restart when WebUI setting changes
    try {
      await invoke('restartApiServer')
    } catch (error) {
      // Failed to restart API server
    }
  }

  const handlePortChange = async (newPort: string) => {
    setWebUIPortInput(newPort)
    const portNumber = parseInt(newPort, 10)

    if (!isNaN(portNumber) && portNumber >= 1024 && portNumber <= 65535) {
      try {
        await invoke('updateWebUISettings', { port: portNumber })
        setWebUIPort(portNumber) // Update the store
        // Restart the server to use the new port
        await invoke('restartApiServer')
      } catch (error) {
        // Error updating port setting
      }
    }
  }

  const handleAutoPortToggle = async () => {
    const newAutoPort = !autoPort
    setAutoPort(newAutoPort)
    setWebUIAutoPort(newAutoPort)

    try {
      await invoke('updateWebUISettings', { autoPort: newAutoPort })
    } catch (error) {
      // Error updating auto port setting
    }
  }

  // Show loading state while store is hydrating
  if (!_hasHydrated) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Web UI Status */}
      <div>
        <label className="block text-base mb-2 text-text-default">
          {t('Settings.general.webUIStatus')}
        </label>
        <div
          className={`text-base px-3 py-2 rounded-md ${
            webUIStatus === 'running'
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              : webUIStatus === 'stopped'
                ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
          }`}
        >
          {webUIStatus === 'running' && t('Settings.general.webUIStatusRunning')}
          {webUIStatus === 'stopped' && t('Settings.general.webUIStatusStopped')}
          {webUIStatus === 'unknown' && t('Settings.general.webUIStatusUnknown')}
        </div>
      </div>

      {/* Enable Web UI Toggle */}
      <SettingsItem
        labelI18nKey="Settings.general.webUI.enableWebUI"
        descriptionI18nKey={
          shouldDisableWebUISettings
            ? 'Settings.general.webUI.enableWebUIDescriptionDisabled'
            : 'Settings.general.webUI.enableWebUIDescription'
        }
      >
        <Button
          onClick={handleWebUIToggle}
          theme="toggle"
          active={currentWebUI}
          disabled={shouldDisableWebUISettings}
        />
      </SettingsItem>

      {/* Automatic Port Toggle */}
      <SettingsItem
        labelI18nKey="Settings.general.webUI.autoPort"
        descriptionI18nKey="Settings.general.webUI.autoPortDescription"
      >
        <Button
          onClick={handleAutoPortToggle}
          theme="toggle"
          active={autoPort}
          disabled={shouldDisableWebUISettings}
        />
      </SettingsItem>

      {/* Web UI Port */}
      <SettingsItem
        labelI18nKey="Settings.general.webUI.port"
        descriptionI18nKey="Settings.general.webUI.portDescription"
      >
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={actualPort && !webUI.port ? actualPort.toString() : webUIPort}
            onChange={(e) => handlePortChange(e.target.value)}
            className={`w-20 px-3 py-2 bg-list-item text-text-default rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              autoPort || shouldDisableWebUISettings ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            min="1024"
            max="65535"
            disabled={!currentWebUI || autoPort || shouldDisableWebUISettings}
          />
          <span className="text-sm text-text-default opacity-70">
            {t('Settings.general.webUI.portRange')}
          </span>
        </div>
      </SettingsItem>

      {/* Web UI URL */}
      {currentWebUI && (
        <SettingsItem
          labelI18nKey="Settings.general.webUI.url"
          descriptionI18nKey="Settings.general.webUI.urlDescription"
        >
          <div className="flex items-center gap-2">
            <div className="px-3 py-2 bg-list-item text-text-default rounded-lg border border-gray-200 dark:border-gray-600">
              http://localhost:{actualPort || webUIPort}
            </div>
            <Button
              onClick={() => window.open(`http://localhost:${actualPort || webUIPort}`, '_blank')}
              theme="default"
              size="s"
              title={t('Settings.general.webUI.openUrl')}
            >
              {t('Settings.general.webUI.open')}
            </Button>
          </div>
        </SettingsItem>
      )}
    </div>
  )
}

export default SettingsWebUIPreferences
