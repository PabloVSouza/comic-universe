import Button from 'components/Button'
import usePersistStore from 'store/usePersistStore'
import SettingsItem from '../SettingsItem'

const DebugSettings = () => {
  const { debug, setDebugLogging, _hasHydrated } = usePersistStore()

  const handleDebugLoggingToggle = () => {
    setDebugLogging(!debug.enableDebugLogging)
  }

  if (!_hasHydrated) {
    return (
      <SettingsItem
        labelI18nKey="Settings.general.debug.enableLogging"
        descriptionI18nKey="Settings.general.debug.enableLoggingDescription"
      >
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </SettingsItem>
    )
  }

  return (
    <SettingsItem
      labelI18nKey="Settings.general.debug.enableLogging"
      descriptionI18nKey="Settings.general.debug.enableLoggingDescription"
    >
      <Button onClick={handleDebugLoggingToggle} theme="toggle" active={debug.enableDebugLogging} />
    </SettingsItem>
  )
}

export default DebugSettings
