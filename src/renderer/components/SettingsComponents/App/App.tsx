import DebugSettings from './DebugSettings'
import LanguageSettings from './LanguageSettings'
import ThemeSettings from './ThemeSettings'
import UpdatePreferences from './UpdatePreferences'
import WebUIPreferences from './WebUIPreferences'
import Box from '../Box'
import Title from '../Title'

const SettingsApp = () => {
  return (
    <div className="h-full w-full flex flex-col relative">
      <Title i18nKey="Settings.app.title" variant="main" />

      <div className="flex-1 overflow-y-auto pt-20 p-6">
        <div className="mx-auto space-y-8">
          <Box>
            <UpdatePreferences />
          </Box>
          <Box>
            <Title i18nKey="Settings.general.title" variant="section" />
            <div className="space-y-6">
              <ThemeSettings />
              <LanguageSettings />
              <DebugSettings />
            </div>
          </Box>
          <Box>
            <WebUIPreferences />
          </Box>
        </div>
      </div>
    </div>
  )
}

export default SettingsApp
