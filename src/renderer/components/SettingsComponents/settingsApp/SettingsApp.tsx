import LanguageSettings from './LanguageSettings'
import DebugSettings from './DebugSettings'
import ThemeSettings from './ThemeSettings'
import UpdatePreferences from './UpdatePreferences'
import WebUIPreferences from './WebUIPreferences'
import SettingsBox from '../SettingsBox'
import SettingsTitle from '../SettingsTitle'

const SettingsApp = () => {
  return (
    <div className="h-full w-full flex flex-col relative">
      <SettingsTitle i18nKey="Settings.app.title" variant="main" />

      <div className="flex-1 overflow-y-auto pt-20 p-6">
        <div className="mx-auto space-y-8">
          <SettingsBox>
            <UpdatePreferences />
          </SettingsBox>
          <SettingsBox>
            <SettingsTitle i18nKey="Settings.general.title" variant="section" />
            <div className="space-y-6">
              <ThemeSettings />
              <LanguageSettings />
              <DebugSettings />
            </div>
          </SettingsBox>
          <SettingsBox>
            <WebUIPreferences />
          </SettingsBox>
        </div>
      </div>
    </div>
  )
}

export default SettingsApp
