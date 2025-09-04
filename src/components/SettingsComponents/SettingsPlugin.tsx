import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useApi from 'api'
import SettingsPluginList from 'components/SettingsComponents/SettingsPluginList'
import Select from 'components/Select'
import Button from 'components/Button'
import { addGlobalDebugLog } from 'components/DebugConsole'

import downloadIcon from 'assets/download-icon-3.svg'
import confirmIcon from 'assets/confirm.svg'

const SettingsPlugin = () => {
  const { invoke } = useApi()
  const queryClient = useQueryClient()

  const { data: pluginsList } = useQuery({
    queryKey: ['pluginsList'],
    queryFn: async () => {
      try {
        return await invoke('getPluginInfoList')
      } catch (error) {
        console.error('Error fetching plugins list:', error)
        return []
      }
    },
    initialData: []
  })

  const { data: apiPlugins } = useQuery({
    queryKey: ['apiPlugins'],
    queryFn: async () => {
      try {
        return (await invoke('getPluginsFromApi')) as IRepoApiPluginList[]
      } catch (error) {
        console.error('Error fetching API plugins:', error)
        return []
      }
    },
    initialData: []
  })

  const { mutate: updatePlugins } = useMutation({
    mutationFn: async () => {
      try {
        await invoke('installPlugins')
        await invoke('activatePlugins')
        await invoke('resetEvents')
        queryClient.invalidateQueries({ queryKey: ['pluginsList'] })
      } catch (error) {
        console.error('Error updating plugins:', error)
        throw error
      }
    }
  })

  const { mutate: downloadAndInstallPlugin } = useMutation({
    mutationFn: async (plugin: string) => {
      try {
        await invoke('downloadAndInstallPlugin', plugin)
        updatePlugins()
      } catch (error) {
        console.error('Error downloading plugin:', error)
        throw error
      }
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

  const testHQNowPlugin = async () => {
    try {
      addGlobalDebugLog(`🧪 Testing HQ Now plugin...`)
      
      // First, check if plugin is active
      const isActive = await invoke('isPluginActive', { pluginName: 'hqnow' })
      addGlobalDebugLog(`📊 Plugin active status: ${isActive}`)
      
      if (isActive) {
        // Test the search method
        addGlobalDebugLog(`🔍 Testing search method...`)
        const searchResult = await invoke('executePluginMethod', {
          pluginName: 'hqnow',
          method: 'search',
          args: { search: 'Batman' }
        })
        addGlobalDebugLog(`📋 Search result: ${JSON.stringify(searchResult, null, 2)}`)
      } else {
        addGlobalDebugLog(`❌ Plugin not active, trying to activate...`)
        await invoke('activatePlugins')
        addGlobalDebugLog(`✅ Plugins activated, retrying...`)
        
        const retryResult = await invoke('executePluginMethod', {
          pluginName: 'hqnow',
          method: 'search',
          args: { search: 'Batman' }
        })
        addGlobalDebugLog(`📋 Retry result: ${JSON.stringify(retryResult, null, 2)}`)
      }
    } catch (error) {
      addGlobalDebugLog(`❌ Plugin test error: ${error}`)
    }
  }

  useEffect(() => {
    setSelectedPluginToInstall('')
  }, [pluginsList])

  const pluginSelectOptions = (apiPlugins || [])
    .map((val) => ({
      label: val.name,
      value: val.repo
    }))
    .filter((val) => !(pluginsList || []).find((plugin) => plugin.name == val.label))

  // Add error boundary-like behavior
  try {
    return (
    <div className="grow flex justify-center items-center p-2 flex-col gap-5">
      <h2 className="text-2xl">Plugin Settings</h2>
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
      
      {/* Plugin Testing Section */}
      <div className="w-full flex flex-col gap-3 mt-4">
        <h3 className="text-lg font-semibold">Plugin Testing</h3>
        <div className="flex gap-2">
          <Button
            icon={confirmIcon}
            theme="pure"
            size="s"
            title="Test HQ Now Plugin"
            onClick={testHQNowPlugin}
          />
        </div>
      </div>
    </div>
    )
  } catch (error) {
    console.error('SettingsPlugin component error:', error)
    return (
      <div className="grow flex justify-center items-center p-2 flex-col gap-5">
        <h2 className="text-2xl">Plugin Settings</h2>
        <div className="text-red-500">
          Error loading plugin settings. Check console for details.
        </div>
        <div className="w-full flex flex-col gap-3 mt-4">
          <h3 className="text-lg font-semibold">Plugin Testing</h3>
          <div className="flex gap-2">
            <Button
              icon={confirmIcon}
              theme="pure"
              size="s"
              title="Test HQ Now Plugin"
              onClick={testHQNowPlugin}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default SettingsPlugin
