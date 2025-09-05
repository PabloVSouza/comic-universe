import Image from 'components/Image'
import { useTranslation } from 'react-i18next'
import FixFilePaths from 'functions/fixFilePaths'

const SettingsPluginListItem = ({ plugin }: { plugin: IRepoPluginInfo }) => {
  const { t } = useTranslation()
  const iconPath = FixFilePaths(plugin.iconPath)
  return (
    <li className="flex h-28 bg-oposite text-text-oposite p-2">
      <div className="gap-1 grow shrink-0 flex flex-col justify-center">
        <p className="font-bold">{plugin.name}</p>
        <p className="flex gap-1">
          <span>
            {t('General.version')}: {plugin.version}
          </span>
          <span>
            {t('General.author')}: {plugin.author}
          </span>
        </p>
        <a href={plugin.repository} target="_blank">
          <u>{t('General.githubRepository')}</u>
        </a>
      </div>
      <Image src={iconPath} className="shrink-0 h-full aspect-square object-contain" />
    </li>
  )
}

export default SettingsPluginListItem
