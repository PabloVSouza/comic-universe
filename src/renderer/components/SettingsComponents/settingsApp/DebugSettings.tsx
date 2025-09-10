import usePersistStore from 'store/usePersistStore'
import Button from 'components/Button'
import SettingsItem from '../SettingsItem'

const DebugSettings = () => {
  const { debug, setDebugLogging } = usePersistStore()

  const handleDebugLoggingToggle = () => {
    setDebugLogging(!debug.enableDebugLogging)
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
