import { ReactElement, useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { pluginIcon, userIcon, settingsIcon, infoIcon } from 'assets'
import { About, App, List, Plugin, User } from 'components/SettingsComponents'

const Settings = ({ initialTab }: { initialTab?: string }): ReactElement => {
  const [activeOption, setActiveOption] = useState(initialTab || 'general')

  const { t } = useTranslation()

  const settingsOptions: ISettingsOption[] = useMemo(
    () => [
      {
        label: t('Settings.options.generalLabel'),
        tag: 'general',
        icon: settingsIcon,
        onClick: () => setActiveOption('general')
      },
      {
        label: t('Settings.options.userLabel'),
        icon: userIcon,
        tag: 'user',
        onClick: () => setActiveOption('user')
      },
      {
        label: t('Settings.options.pluginsLabel'),
        icon: pluginIcon,
        tag: 'plugins',
        onClick: () => setActiveOption('plugins')
      },
      {
        label: t('HomeNav.about'),
        icon: infoIcon,
        tag: 'about',
        onClick: () => setActiveOption('about')
      }
    ],
    [t]
  )

  useEffect(() => {
    if (!initialTab) {
      setActiveOption(settingsOptions[0].tag)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTab])

  const componentList = {
    general: App,
    user: User,
    plugins: Plugin,
    about: About
  }

  const Components = componentList[activeOption]

  return (
    <>
      <List options={settingsOptions} activeOption={activeOption} />
      <Components />
    </>
  )
}

const getWindowSettings = () => {
  return {
    windowProps: {
      className: 'overflow-auto',
      contentClassName: 'size-full flex',
      titleBar: true,
      closeable: true,
      unique: true,
      title: 'Settings'
    },
    initialStatus: {
      startPosition: 'center',
      width: 750,
      height: 600
    }
  } as TWindow
}

export default { Settings, ...getWindowSettings() }
