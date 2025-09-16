import { useTranslation } from 'react-i18next'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { createRef } from 'react'
import SettingsPluginListItem from './SettingsPluginListItem'

const SettingsPluginList = ({ pluginsList }: { pluginsList: IRepoPluginInfo[] }) => {
  const { t } = useTranslation()

  if (pluginsList.length === 0) {
    return (
      <div className="text-center py-8 text-text-default opacity-50">
        <p>{t('Settings.plugin.installed.noPluginsInstalled')}</p>
      </div>
    )
  }

  return (
    <TransitionGroup className="space-y-3">
      {pluginsList.map((plugin) => {
        const nodeRef = createRef<HTMLDivElement>()
        return (
          <CSSTransition
            key={plugin.name}
            nodeRef={nodeRef}
            timeout={300}
            classNames="plugin-item"
            appear={true}
          >
            <div ref={nodeRef} className="plugin-item-container">
              <SettingsPluginListItem plugin={plugin} />
            </div>
          </CSSTransition>
        )
      })}
    </TransitionGroup>
  )
}

export default SettingsPluginList
