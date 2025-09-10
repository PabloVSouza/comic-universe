import { useState, useEffect } from 'react'
import usePersistStore from 'store/usePersistStore'
import useApi from 'api'
import Button from 'components/Button'
import SettingsItem from '../SettingsItem'

const WebUISettings = () => {
  const { webUI, setWebUI, _hasHydrated } = usePersistStore()
  const { invoke } = useApi()
  const [currentWebUI, setCurrentWebUI] = useState(webUI.enableWebUI)

  useEffect(() => {
    setCurrentWebUI(webUI.enableWebUI)
  }, [webUI])

  const handleWebUIToggle = async () => {
    const newValue = !currentWebUI
    setCurrentWebUI(newValue)
    setWebUI(newValue)

    // Trigger API server restart when WebUI setting changes
    try {
      await invoke('restartApiServer')
      console.log('API server restarted due to WebUI setting change')
    } catch (error) {
      console.error('Failed to restart API server:', error)
    }
  }

  // Show loading state while store is hydrating
  if (!_hasHydrated) {
    return (
      <SettingsItem
        labelI18nKey="Settings.general.webUI.enableWebUI"
        descriptionI18nKey="Settings.general.webUI.enableWebUIDescription"
      >
        <div className="h-6 w-11 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
      </SettingsItem>
    )
  }

  return (
    <SettingsItem
      labelI18nKey="Settings.general.webUI.enableWebUI"
      descriptionI18nKey="Settings.general.webUI.enableWebUIDescription"
    >
      <Button onClick={handleWebUIToggle} theme="toggle" active={currentWebUI} />
    </SettingsItem>
  )
}

export default WebUISettings
