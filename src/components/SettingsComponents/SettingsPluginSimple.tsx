import useApi from 'api'
import Button from 'components/Button'
import { addGlobalDebugLog } from 'components/DebugConsole'

import confirmIcon from 'assets/confirm.svg'

const SettingsPluginSimple = () => {
  const { invoke } = useApi()

  const testHQNowPlugin = async () => {
    try {
      addGlobalDebugLog(`🧪 Testing HQ Now plugin...`)
      
      // First, get list of active plugins to see what's available
      const activePlugins = await invoke('getActivePlugins')
      addGlobalDebugLog(`📋 Active plugins: ${JSON.stringify(activePlugins, null, 2)}`)
      
      const pluginName = 'comic-universe-plugin-hqnow'
      const isActive = await invoke('isPluginActive', { pluginName })
      addGlobalDebugLog(`📊 Plugin '${pluginName}' active status: ${isActive}`)
      
      if (isActive) {
        // Test multiple methods
        addGlobalDebugLog(`🔍 Testing search method...`)
        const searchResult = await invoke('executePluginMethod', {
          pluginName,
          method: 'search',
          args: { search: 'Batman' }
        })
        addGlobalDebugLog(`📋 Search result: ${JSON.stringify(searchResult, null, 2)}`)
        
        addGlobalDebugLog(`📚 Testing getList method...`)
        const listResult = await invoke('executePluginMethod', {
          pluginName,
          method: 'getList',
          args: {}
        })
        addGlobalDebugLog(`📋 List result: ${JSON.stringify(listResult, null, 2)}`)
        
        addGlobalDebugLog(`📖 Testing getDetails method...`)
        const detailsResult = await invoke('executePluginMethod', {
          pluginName,
          method: 'getDetails',
          args: { siteId: '123' }
        })
        addGlobalDebugLog(`📋 Details result: ${JSON.stringify(detailsResult, null, 2)}`)
        
        addGlobalDebugLog(`📚 Testing getChapters method...`)
        const chaptersResult = await invoke('executePluginMethod', {
          pluginName,
          method: 'getChapters',
          args: { siteId: '123' }
        })
        addGlobalDebugLog(`📋 Chapters result: ${JSON.stringify(chaptersResult, null, 2)}`)
        
        addGlobalDebugLog(`✅ All HQ Now plugin methods tested successfully!`)
        
        // Test search with different terms
        addGlobalDebugLog(`🔍 Testing search with 'spider'...`)
        const spiderResult = await invoke('search', {
          repo: 'hqnow',
          data: { search: 'spider' }
        })
        addGlobalDebugLog(`🕷️ Spider search result: ${JSON.stringify(spiderResult, null, 2)}`)
        
        addGlobalDebugLog(`🔍 Testing search with 'superman'...`)
        const supermanResult = await invoke('search', {
          repo: 'hqnow',
          data: { search: 'superman' }
        })
        addGlobalDebugLog(`🦸 Superman search result: ${JSON.stringify(supermanResult, null, 2)}`)
        
        // Test API connectivity
        addGlobalDebugLog(`🌐 Testing API connectivity...`)
        const connectivityTest = await invoke('search', {
          repo: 'hqnow',
          data: { search: 'test' }
        })
        addGlobalDebugLog(`🌐 Connectivity test result: ${JSON.stringify(connectivityTest, null, 2)}`)
      } else {
        addGlobalDebugLog(`❌ Plugin not active, trying to activate...`)
        await invoke('activatePlugins')
        addGlobalDebugLog(`✅ Plugins activated, retrying...`)
        
        const retryResult = await invoke('executePluginMethod', {
          pluginName,
          method: 'search',
          args: { search: 'Batman' }
        })
        addGlobalDebugLog(`📋 Retry result: ${JSON.stringify(retryResult, null, 2)}`)
      }
    } catch (error) {
      addGlobalDebugLog(`❌ Plugin test error: ${error}`)
    }
  }

  return (
    <div className="grow flex justify-center items-center p-2 flex-col gap-5">
      <h2 className="text-2xl">Plugin Settings</h2>
      <div className="text-center">
        <p className="mb-4">HQ Now plugin testing interface</p>
        
        {/* Plugin Testing Section */}
        <div className="w-full flex flex-col gap-3 mt-4">
          <h3 className="text-lg font-semibold">Plugin Testing</h3>
          <div className="flex gap-2 justify-center">
            <Button
              icon={confirmIcon}
              theme="pure"
              size="s"
              title="Test All HQ Now Methods"
              onClick={testHQNowPlugin}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPluginSimple
