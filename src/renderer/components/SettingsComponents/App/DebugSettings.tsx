import { usePersistStore } from 'store'
import { Button } from 'components/UiComponents'
import Item from '../Item'

const DebugSettings = () => {
  const { debug, setDebugLogging, _hasHydrated } = usePersistStore()

  const handleDebugLoggingToggle = () => {
    setDebugLogging(!debug.enableDebugLogging)
  }

  if (!_hasHydrated) {
    return (
      <Item
        labelI18nKey="Settings.general.debug.enableLogging"
        descriptionI18nKey="Settings.general.debug.enableLoggingDescription"
      >
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </Item>
    )
  }

  return (
    <Item
      labelI18nKey="Settings.general.debug.enableLogging"
      descriptionI18nKey="Settings.general.debug.enableLoggingDescription"
    >
      <Button onClick={handleDebugLoggingToggle} theme="toggle" active={debug.enableDebugLogging} />
    </Item>
  )
}

export default DebugSettings
