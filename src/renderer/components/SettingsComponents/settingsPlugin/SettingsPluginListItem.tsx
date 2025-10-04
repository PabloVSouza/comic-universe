import { useTranslation } from 'react-i18next'
import Image from 'components/Image'
import FixFilePaths from 'functions/fixFilePaths'

const SettingsPluginListItem = ({ plugin }: { plugin: IRepoPluginInfo }) => {
  const { t } = useTranslation()
  const iconPath = FixFilePaths(plugin.iconPath)

  return (
    <div className="flex items-center justify-between p-4 bg-list-item rounded-lg border border-gray-200/50 dark:border-gray-600/50">
      <div className="flex items-center gap-4 flex-1">
        <Image
          src={iconPath}
          className="w-12 h-12 object-contain flex-shrink-0"
          alt={`${plugin.name} icon`}
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-text-default truncate">{plugin.name}</h3>
          <div className="flex flex-wrap gap-4 text-sm text-text-default opacity-70 mt-1">
            <span>
              {t('General.version')}: {plugin.version}
            </span>
            <span>
              {t('General.author')}: {plugin.author}
            </span>
          </div>
          <a
            href={plugin.repository}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
          >
            {t('General.githubRepository')}
          </a>
        </div>
      </div>
    </div>
  )
}

export default SettingsPluginListItem
