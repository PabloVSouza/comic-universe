import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useApi from 'api'
import SettingsPluginList from './SettingsPluginList'
import Select from 'components/Select'
import Button from 'components/Button'
import SettingsTitle from '../SettingsTitle'

import downloadIcon from 'assets/download-icon-3.svg'

const SettingsPlugin = () => {
  const { invoke } = useApi()
  const queryClient = useQueryClient()

  const { data: pluginsList } = useQuery({
    queryKey: ['pluginsList'],
    queryFn: async () => await invoke('getPluginInfoList'),
    initialData: []
  })

  const { data: apiPlugins } = useQuery({
    queryKey: ['apiPlugins'],
    queryFn: async () => (await invoke('getPluginsFromApi')) as IRepoApiPluginList[],
    initialData: []
  })

  const { mutate: updatePlugins } = useMutation({
    mutationFn: async () => {
      await invoke('installPlugins')
      await invoke('activatePlugins')
      await invoke('resetEvents')
      queryClient.invalidateQueries({ queryKey: ['pluginsList'] })
    }
  })

  const { mutate: downloadAndInstallPlugin } = useMutation({
    mutationFn: async (plugin: string) => {
      await invoke('downloadAndInstallPlugin', plugin)
      updatePlugins()
    }
  })

  const [selectedPluginToInstall, setSelectedPluginToInstall] = useState('' as string | TOption)

  const handleSelectPluginToInstall = (val: TOption) => {
    setSelectedPluginToInstall(val)
  }

  const handleButton = () => {
    if (typeof selectedPluginToInstall === 'object')
      downloadAndInstallPlugin(selectedPluginToInstall.value)
  }

  useEffect(() => {
    setSelectedPluginToInstall('')
  }, [pluginsList])

  const pluginSelectOptions = apiPlugins
    .map((val) => ({
      label: val.name,
      value: val.repo
    }))
    .filter((val) => !pluginsList.find((plugin) => plugin.name == val.label))

  return (
    <div className="grow flex justify-center items-center p-2 flex-col gap-5">
      <SettingsTitle i18nKey="Settings.plugin.title" variant="section" className="text-2xl" />
      <div className="w-full h-12 shrink-0 flex justify-center items-start gap-2">
        <Select
          className="!w-1/2 bg-default rounded-lg"
          options={pluginSelectOptions}
          placeholder="Select a plugin to install"
          onChange={(e) => handleSelectPluginToInstall(e as TOption)}
          isDisabled={!pluginSelectOptions.length}
          value={selectedPluginToInstall}
        />
        <Button
          className="h-full"
          icon={downloadIcon}
          theme="pure"
          title="Download and Install Plugin"
          disabled={!selectedPluginToInstall}
          onClick={handleButton}
        />
      </div>
      <SettingsPluginList pluginsList={pluginsList} />
    </div>
  )
}

export default SettingsPlugin
