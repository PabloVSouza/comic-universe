import Image from 'components/Image'

import FixFilePaths from 'functions/fixFilePaths'

import style from './SettingsPluginListItem.module.scss'

const SettingsPluginListItem = ({ plugin }: { plugin: RepoPluginInfo }) => {
  const iconPath = FixFilePaths(plugin.iconPath)
  return (
    <li className={style.SettingsPluginListItem}>
      <div className={style.textArea}>
        <p className={style.name}>{plugin.name}</p>
        <p className={style.VersionAuthor}>
          <span className={style.version}>Version: {plugin.version}</span>
          <span className={style.author}>Author: {plugin.author}</span>
        </p>
        <a href={plugin.repository} target="_blank" rel="noreferrer">
          <u>Github Repository</u>
        </a>
      </div>
      <Image src={iconPath} className={style.icon} />
    </li>
  )
}

export default SettingsPluginListItem
