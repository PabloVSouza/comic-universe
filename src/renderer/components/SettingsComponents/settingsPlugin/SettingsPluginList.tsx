import SettingsPluginListItem from './SettingsPluginListItem'

const SettingsPluginList = ({ pluginsList }: { pluginsList: IRepoPluginInfo[] }) => {
  if (pluginsList.length === 0) {
    return (
      <div className="text-center py-8 text-text-default opacity-50">
        <p>No plugins installed</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {pluginsList.map((plugin) => (
        <SettingsPluginListItem plugin={plugin} key={plugin.name} />
      ))}
    </div>
  )
}

export default SettingsPluginList
