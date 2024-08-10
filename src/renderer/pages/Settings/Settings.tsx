import { ReactElement } from 'react'
import SettingsList from 'components/SettingsComponents/SettingsList/SettingsList'

import style from './Settings.module.scss'

const Settings = (): ReactElement => {
  return (
    <>
      <SettingsList />
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
    movable: true,
    title: 'App Settings'
  },
  initialStatus: {
    startPosition: 'center',
    width: '80%',
    height: '80%'
  }
} as TWindow

export default { Settings, ...windowSettings }
