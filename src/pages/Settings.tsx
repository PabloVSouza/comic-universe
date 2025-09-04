import { ReactElement, useState, useEffect } from 'react'
import SettingsList from 'components/SettingsComponents/SettingsList'
import SettingsGeneral from 'components/SettingsComponents/SettingsGeneral'
import SettingsUser from 'components/SettingsComponents/SettingsUser'
import SettingsPlugin from 'components/SettingsComponents/SettingsPluginSimple'
import useLang from 'lang'

import pluginIcon from 'assets/plugin.svg'
import userIcon from 'assets/user.svg'
import settingsIcon from 'assets/settings.svg'

const Settings = (): ReactElement => {
  const [activeOption, setActiveOption] = useState('general')

  const lang = useLang()

  const settingsOptions: ISettingsOption[] = [
    {
      label: lang.Settings.options.generalLabel,
      tag: 'general',
      icon: settingsIcon,
      onClick: () => setActiveOption('general')
    },
    {
      label: lang.Settings.options.userLabel,
      icon: userIcon,
      tag: 'user',
      onClick: () => setActiveOption('user')
    },
    {
      label: lang.Settings.options.pluginsLabel,
      icon: pluginIcon,
      tag: 'plugins',
      onClick: () => setActiveOption('plugins')
    }
  ]

  useEffect(() => {
    setActiveOption(settingsOptions[0].tag)
  }, [])

  const componentList = {
    general: SettingsGeneral,
    user: SettingsUser,
    plugins: SettingsPlugin
  }

  const Components = componentList[activeOption]

  return (
    <>
      <SettingsList options={settingsOptions} activeOption={activeOption} />
      <Components />
    </>
  )
}

const windowSettings = {
  windowProps: {
    className: 'overflow-auto',
    contentClassName: 'size-full flex',
    titleBar: true,
    closeable: true,
    unique: true,
    title: useLang().Settings.windowTitle
  },
  initialStatus: {
    startPosition: 'center',
    width: 750,
    height: 500
  }
} as TWindow

export default { Settings, ...windowSettings }
