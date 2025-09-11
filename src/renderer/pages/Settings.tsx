import { ReactElement, useState, useEffect, useMemo } from 'react'
import SettingsList from 'components/SettingsComponents/SettingsList'
import SettingsApp from 'components/SettingsComponents/settingsApp'
import SettingsUser from 'components/SettingsComponents/settingsUser'
import SettingsPlugin from 'components/SettingsComponents/settingsPlugin'
import SettingsAbout from 'components/SettingsComponents/settingsAbout'
import { useTranslation } from 'react-i18next'

import pluginIcon from 'assets/plugin.svg'
import userIcon from 'assets/user.svg'
import settingsIcon from 'assets/settings.svg'
import infoIcon from 'assets/info.svg'

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
  }, [initialTab, settingsOptions])

  const componentList = {
    general: SettingsApp,
    user: SettingsUser,
    plugins: SettingsPlugin,
    about: SettingsAbout
  }

  const Components = componentList[activeOption]

  return (
    <>
      <SettingsList options={settingsOptions} activeOption={activeOption} />
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
