import { ReactElement, useState, useEffect } from 'react'
import SettingsList from 'components/SettingsComponents/SettingsList'

import SettingsGeneral from 'components/SettingsComponents/SettingsGeneral'
import SettingsUser from 'components/SettingsComponents/SettingsUser'
import SettingsPlugin from 'components/SettingsComponents/SettingsPlugin'

import style from './Settings.module.scss'

import pluginIcon from 'assets/plugin.svg'
import userIcon from 'assets/user.svg'
import settingsIcon from 'assets/settings.svg'

const Settings = (): ReactElement => {
  const [activeOption, setActiveOption] = useState('general')

  const settingsOptions: ISettingsOption[] = [
    {
      label: 'General Settings',
      tag: 'general',
      icon: settingsIcon,
      onClick: () => setActiveOption('general')
    },
    {
      label: 'User Settings',
      icon: userIcon,
      tag: 'user',
      onClick: () => setActiveOption('user')
    },
    {
      label: 'Plugins',
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
    className: style.Settings,
    contentClassName: style.Content,
    titleBar: true,
    closeable: true,
    unique: true,
    title: 'App Settings'
  },
  initialStatus: {
    startPosition: 'center',
    width: '80%',
    height: '80%'
  }
} as TWindow

export default { Settings, ...windowSettings }
