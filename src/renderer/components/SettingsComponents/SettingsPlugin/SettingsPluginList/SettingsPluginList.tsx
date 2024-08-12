import SettingsPluginListItem from '../SettingsPluginListItem'
import style from './SettingsPluginList.module.scss'

const SettingsPluginList = ({ pluginsList }: { pluginsList: IRepoPluginInfo[] }) => {
  return (
    <ul className={style.SettingsPluginList}>
      {pluginsList.map((plugin) => (
        <SettingsPluginListItem plugin={plugin} key={plugin.name} />
      ))}
    </ul>
  )
}

export default SettingsPluginList
