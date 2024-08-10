import { ReactElement, useState, useEffect } from 'react'
import SettingsList from 'components/SettingsComponents/SettingsList'

import style from './Settings.module.scss'

import pluginIcon from 'assets/plugin.svg'

const Settings = (): ReactElement => {
  const [activeOption, setActiveOption] = useState('')

  const settingsOptions: ISettingsOption[] = [
    {
      label: 'Plugins',
      icon: pluginIcon,
      onClick: () => setActiveOption('Plugins')
    }
  ]

  useEffect(() => {
    setActiveOption(settingsOptions[0].label)
  }, [])

  return (
    <>
      <SettingsList options={settingsOptions} />
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
