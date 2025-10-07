import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useApi, useEnvironment } from 'hooks'
import { usePersistStore } from 'store'
import { Button, DisplayValue, Input } from 'components/UiComponents'
import Item from '../Item'

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
    if (webUI.autoPort !== undefined) {
      setAutoPort(webUI.autoPort)
    }
    if (webUI.port !== undefined) {
      setWebUIPortInput(webUI.port.toString())
    }
  }, [webUI])

  useEffect(() => {
    const loadWebUIStatus = async () => {
      try {
        setWebUIStatus(currentWebUI ? 'running' : 'stopped')

        if (currentWebUI) {
          const portResult = await invoke<{ port?: number }>('getWebUIPort')
          if (portResult && portResult.port) {
            setActualPort(portResult.port)
            if (!webUI.port) {
              setWebUIPortInput(portResult.port.toString())
            }
          }
        }
      } catch {
        setWebUIStatus('unknown')
      }
    }

    loadWebUIStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWebUI, webUI.port])

  const handleWebUIToggle = async () => {
    const newValue = !currentWebUI
    setCurrentWebUI(newValue)
    setWebUI(newValue)

    try {
      await invoke<void>('restartApiServer')
    } catch (error) {
      console.error('Error toggling Web UI:', error)
    }
  }

  const handlePortChange = async (newPort: string) => {
    setWebUIPortInput(newPort)
    const portNumber = parseInt(newPort, 10)

    if (!isNaN(portNumber) && portNumber >= 1024 && portNumber <= 65535) {
      try {
        await invoke<void>('updateWebUISettings', { port: portNumber })
        setWebUIPort(portNumber)
        await invoke<void>('restartApiServer')
      } catch (error) {
        console.error('Error updating port:', error)
      }
    }
  }

  const handleAutoPortToggle = async () => {
    const newAutoPort = !autoPort
    setAutoPort(newAutoPort)
    setWebUIAutoPort(newAutoPort)

    try {
      await invoke<void>('updateWebUISettings', { autoPort: newAutoPort })
    } catch (error) {
      console.error('Error updating auto port:', error)
    }
  }

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
      {}
      <Item labelI18nKey="Settings.general.webUIStatus">
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
      </Item>

      {}
      <Item
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
      </Item>

      {}
      <Item
        labelI18nKey="Settings.general.webUI.autoPort"
        descriptionI18nKey="Settings.general.webUI.autoPortDescription"
      >
        <Button
          onClick={handleAutoPortToggle}
          theme="toggle"
          active={autoPort}
          disabled={shouldDisableWebUISettings}
        />
      </Item>

      {}
      <Item
        labelI18nKey="Settings.general.webUI.port"
        descriptionI18nKey="Settings.general.webUI.portDescription"
      >
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={actualPort && !webUI.port ? actualPort.toString() : webUIPort}
            onChange={(e) => handlePortChange(e.target.value)}
            className="w-20"
            min="1024"
            max="65535"
            disabled={!currentWebUI || autoPort || shouldDisableWebUISettings}
          />
          <span className="text-sm text-text-default opacity-70">
            {t('Settings.general.webUI.portRange')}
          </span>
        </div>
      </Item>

      {}
      {currentWebUI && (
        <Item
          labelI18nKey="Settings.general.webUI.url"
          descriptionI18nKey="Settings.general.webUI.urlDescription"
        >
          <DisplayValue
            href={`http://localhost:${actualPort || webUIPort}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 dark:text-blue-400 inline-block"
          >
            http://localhost:{actualPort || webUIPort}
          </DisplayValue>
        </Item>
      )}
    </div>
  )
}

export default SettingsWebUIPreferences
