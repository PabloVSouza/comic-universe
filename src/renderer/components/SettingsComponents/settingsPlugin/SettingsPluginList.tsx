import SettingsPluginListItem from './SettingsPluginListItem'

const SettingsPluginList = ({ pluginsList }: { pluginsList: IRepoPluginInfo[] }) => {
  return (
    <ul className="w-full h-96 flex flex-col gap-px">
      {pluginsList.map((plugin) => (
        <SettingsPluginListItem plugin={plugin} key={plugin.name} />
      ))}
    </ul>
  )
}

export default SettingsPluginList
