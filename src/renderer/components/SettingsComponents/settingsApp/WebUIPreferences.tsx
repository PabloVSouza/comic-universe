import { useTranslation } from 'react-i18next'
import useEnvironment from 'hooks/useEnvironment'
import SettingsWebUIPreferences from './SettingsWebUIPreferences'

const WebUIPreferences = () => {
  const { t } = useTranslation()
  const { shouldDisableWebUISettings } = useEnvironment()

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3
          className={`text-xl ${shouldDisableWebUISettings ? 'text-gray-400' : 'text-text-default'}`}
        >
          {t('Settings.general.webUIPreferences')}
        </h3>
      </div>
      <SettingsWebUIPreferences />
    </div>
  )
}

export default WebUIPreferences
