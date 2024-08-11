import Image from 'components/Image'

import FixFilePaths from 'functions/fixFilePaths'

import style from './SettingsPluginListItem.module.scss'

const SettingsPluginListItem = ({ plugin }: { plugin: RepoPluginInfo }) => {
  const iconPath = FixFilePaths(plugin.iconPath)
  return (
    <li>
      <div className={style.textArea}>
        <p className={style.name}>{plugin.name}</p>
        <span className={style.version}>{plugin.version}</span>
        <span className={style.author}>{plugin.author}</span>
      </div>
      <Image src={iconPath} className={style.icon} />
    </li>
  )
}

export default SettingsPluginListItem
