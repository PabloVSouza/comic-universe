import { useState, useEffect } from 'react'
import { useApi } from 'hooks'
import { usePersistStore } from 'store'
import { Item } from 'components/SettingsComponents'
import { Button } from 'components/UiComponents'

const WebUISettings = () => {
  const { webUI, setWebUI, _hasHydrated } = usePersistStore()
  const { invoke } = useApi()
  const [currentWebUI, setCurrentWebUI] = useState(webUI.enableWebUI)

  const isWebUIMode = window.location.origin.includes('localhost:8888')

  useEffect(() => {
    setCurrentWebUI(webUI.enableWebUI)
  }, [webUI])

  const handleWebUIToggle = async () => {
    const newValue = !currentWebUI
    setCurrentWebUI(newValue)
    setWebUI(newValue)

    try {
      await invoke('restartApiServer')
    } catch (error) {
      console.error('Failed to restart API server:', error)
    }
  }

  if (!_hasHydrated) {
    return (
      <Item
        labelI18nKey="Settings.general.webUI.enableWebUI"
        descriptionI18nKey="Settings.general.webUI.enableWebUIDescription"
      >
        <div className="h-6 w-11 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
      </Item>
    )
  }

  return (
    <Item
      labelI18nKey="Settings.general.webUI.enableWebUI"
      descriptionI18nKey={
        isWebUIMode
          ? 'Settings.general.webUI.enableWebUIDescriptionDisabled'
          : 'Settings.general.webUI.enableWebUIDescription'
      }
    >
      <Button
        onClick={handleWebUIToggle}
        theme="toggle"
        active={currentWebUI}
        disabled={isWebUIMode}
      />
    </Item>
  )
}

export default WebUISettings
