import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { downloadIcon3, loadingIcon } from 'assets'
import { useApi } from 'hooks'
import usePersistSessionStore from 'store/usePersistSessionStore'
import { Item } from 'components/SettingsComponents'
import { Button, Select } from 'components/UiComponents'

const PluginInstallSettings = () => {
  const { t } = useTranslation()
  const { invoke } = useApi()
  const queryClient = useQueryClient()
  const { currentUser } = usePersistSessionStore()

  const { data: pluginsList } = useQuery({
    queryKey: ['pluginsList', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return []
      return await invoke<IRepoPluginInfo[]>('getPluginInfoList', { userId: currentUser.id })
    },
    initialData: [],
    enabled: !!currentUser?.id
  })

  const { data: apiPlugins } = useQuery({
    queryKey: ['apiPlugins'],
    queryFn: async () => await invoke<IRepoApiPluginList[]>('getPluginsFromApi'),
    initialData: []
  })

  const { mutate: updatePlugins } = useMutation({
    mutationFn: async () => {
      if (!currentUser?.id) return
      await invoke<void>('refreshPluginHandlers', { userId: currentUser.id })
      queryClient.invalidateQueries({ queryKey: ['pluginsList', currentUser.id] })
    }
  })

  const { mutate: installPlugin, isPending: isInstalling } = useMutation({
    mutationFn: async (pluginData: IRepoApiPluginList) => {
      if (!currentUser?.id) {
        throw new Error('User not logged in')
      }
      
      const tag = pluginData.tag || pluginData.name.toLowerCase().replace(/\s+/g, '-')
      
      const plugin = {
        name: pluginData.name,
        url: pluginData.repo,
        tag: tag,
        logo: pluginData.logoUrl || undefined,
        description: pluginData.description || undefined,
        enabled: true
      }

      await invoke('createPlugin', { plugin, userId: currentUser.id })
      await invoke('refreshPluginHandlers', { userId: currentUser.id })
      queryClient.invalidateQueries({ queryKey: ['pluginsList', currentUser.id] })
    }
  })

  const [selectedPluginToInstall, setSelectedPluginToInstall] = useState('' as string | TOption)

  const handleSelectPluginToInstall = (val: TOption) => {
    setSelectedPluginToInstall(val)
  }

  const handleInstallPlugin = () => {
    if (typeof selectedPluginToInstall === 'object') {
      const pluginData = apiPlugins.find((p) => p.repo === selectedPluginToInstall.value)
      if (pluginData) {
        installPlugin(pluginData)
      }
    }
  }

  useEffect(() => {
    setSelectedPluginToInstall('')
  }, [pluginsList])

  const pluginSelectOptions = apiPlugins
    .map((val) => ({
      label: val.name,
      value: val.repo,
      plugin: val
    }))
    .filter((val) => !pluginsList.find((plugin) => plugin.name == val.label))

  return (
    <Item
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
    </Item>
  )
}

export default PluginInstallSettings
