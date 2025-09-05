import { ReactElement, useState, useEffect } from 'react'
import SettingsList from 'components/SettingsComponents/SettingsList'
import SettingsGeneral from 'components/SettingsComponents/SettingsGeneral'
import SettingsUser from 'components/SettingsComponents/SettingsUser'
import SettingsPlugin from 'components/SettingsComponents/SettingsPlugin'
import { useTranslation } from 'react-i18next'

import pluginIcon from 'assets/plugin.svg'
import userIcon from 'assets/user.svg'
import settingsIcon from 'assets/settings.svg'

const Settings = (): ReactElement => {
  const [activeOption, setActiveOption] = useState('general')

  const { t } = useTranslation()

  const settingsOptions: ISettingsOption[] = [
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

const getWindowSettings = () => {
  return {
    windowProps: {
      className: 'overflow-auto',
      contentClassName: 'size-full flex',
      titleBar: true,
      closeable: true,
      unique: true,
      title: 'Settings' // Will be translated dynamically in openWindow
    },
    initialStatus: {
      startPosition: 'center',
      width: 750,
      height: 500
    }
  } as TWindow
}

export default { Settings, ...getWindowSettings() }
