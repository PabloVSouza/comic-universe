import { useQuery } from '@tanstack/react-query'
import useApi from 'api'
import SettingsPluginList from './SettingsPluginList'
import PluginInstallSettings from './PluginInstallSettings'
import SettingsBox from '../SettingsBox'
import SettingsTitle from '../SettingsTitle'

const SettingsPlugin = () => {
  const { invoke } = useApi()

  const { data: pluginsList } = useQuery({
    queryKey: ['pluginsList'],
    queryFn: async () => await invoke('getPluginInfoList'),
    initialData: []
  })

  return (
    <div className="h-full w-full flex flex-col relative">
      <SettingsTitle i18nKey="Settings.plugin.title" variant="main" />

      <div className="flex-1 overflow-y-auto pt-20 p-6">
        <div className="mx-auto space-y-8">
          <SettingsBox>
            <PluginInstallSettings />
          </SettingsBox>

          <SettingsBox>
            <SettingsTitle i18nKey="Settings.plugin.installed.title" variant="section" />
            <div className="mt-6">
              <SettingsPluginList pluginsList={pluginsList} />
            </div>
          </SettingsBox>
        </div>
      </div>
    </div>
  )
}

export default SettingsPlugin
