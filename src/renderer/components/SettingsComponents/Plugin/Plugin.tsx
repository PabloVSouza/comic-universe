import { useQuery } from '@tanstack/react-query'
import { useApi } from 'hooks'
import { Box, Title } from 'components/SettingsComponents'
import PluginInstallSettings from './PluginInstallSettings'
import PluginList from './PluginList'

const SettingsPlugin = () => {
  const { invoke } = useApi()

  const { data: pluginsList } = useQuery({
    queryKey: ['pluginsList'],
    queryFn: async () => await invoke<IRepoPluginInfo[]>('getPluginInfoList'),
    initialData: []
  })

  return (
    <div className="h-full w-full flex flex-col relative">
      <Title i18nKey="Settings.plugin.title" variant="main" />

      <div className="flex-1 overflow-y-auto pt-20 p-6">
        <div className="mx-auto space-y-8">
          <Box>
            <PluginInstallSettings />
          </Box>

          <Box>
            <Title i18nKey="Settings.plugin.installed.title" variant="section" />
            <div className="mt-6">
              <PluginList pluginsList={pluginsList} />
            </div>
          </Box>
        </div>
      </div>
    </div>
  )
}

export default SettingsPlugin
