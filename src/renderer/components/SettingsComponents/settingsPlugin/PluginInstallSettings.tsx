import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import useApi from 'api'
import Select from 'components/Select'
import Button from 'components/Button'
import SettingsItem from '../SettingsItem'

import { downloadIcon3, loadingIcon } from 'assets'

const PluginInstallSettings = () => {
  const { t } = useTranslation()
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
      await invoke('refreshPluginHandlers')
      queryClient.invalidateQueries({ queryKey: ['pluginsList'] })
    }
  })

  const { mutate: downloadAndInstallPlugin, isPending: isInstalling } = useMutation({
    mutationFn: async (plugin: string) => {
      await invoke('downloadAndInstallPlugin', plugin)
      updatePlugins()
    }
  })

  const [selectedPluginToInstall, setSelectedPluginToInstall] = useState('' as string | TOption)

  const handleSelectPluginToInstall = (val: TOption) => {
    setSelectedPluginToInstall(val)
  }

  const handleInstallPlugin = () => {
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
    <SettingsItem
      labelI18nKey="Settings.plugin.install.label"
      descriptionI18nKey="Settings.plugin.install.description"
    >
      <div className="flex gap-2 items-center">
        <Select
          className="!w-64 bg-list-item rounded-lg"
          options={pluginSelectOptions}
          placeholder={t('Settings.plugin.install.selectPlaceholder')}
          onChange={(e) => handleSelectPluginToInstall(e as TOption)}
          isDisabled={!pluginSelectOptions.length || isInstalling}
          value={selectedPluginToInstall}
        />
        <Button
          className={`h-10 ${isInstalling ? '[&>img]:animate-spin' : ''}`}
          icon={isInstalling ? loadingIcon : downloadIcon3}
          theme="pure"
          title={t('Settings.plugin.install.buttonTitle')}
          disabled={!selectedPluginToInstall || isInstalling}
          onClick={handleInstallPlugin}
        />
      </div>
    </SettingsItem>
  )
}

export default PluginInstallSettings
