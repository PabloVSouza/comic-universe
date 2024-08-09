import { useNavigate } from 'react-router-dom'
const { invoke } = window.Electron.ipcRenderer
import classNames from 'classnames'
import Cover from 'components/Cover/Cover'
import openWindow from 'functions/openWindow'

import useLang from 'lang'

import useGlobalStore from 'store/useGlobalStore'

import usePersistStore from 'store/usePersistStore'

import style from './HomeNav.module.scss'

import infoIcon from 'assets/info.svg'
import settingsIcon from 'assets/settings.svg'
import darkmodeIcon from 'assets/darkmode.svg'
import userIcon from 'assets/user.svg'
import exitIcon from 'assets/exit-door.svg'
import refreshIcon from 'assets/refresh.svg'

const HomeNav = (): JSX.Element => {
  const { menuVisible, toggleMenu, updatePlugins } = useGlobalStore()
  const { switchTheme, currentUser } = usePersistStore()

  const navigate = useNavigate()
  const texts = useLang()
  const activeUser = !!currentUser.id

  const closeApp = (): void => {
    invoke('closeWindow')
  }

  const options = [
    {
      label: texts.HomeNav.about,
      icon: infoIcon,
      onClick: (): void => openWindow({ component: 'About', props: {} })
    },
    {
      label: texts.HomeNav.settings,
      icon: settingsIcon,
      onClick: () => openWindow({ component: 'Settings', props: {} })
    },
    {
      label: texts.HomeNav.darkMode,
      icon: darkmodeIcon,
      onClick: (): void => switchTheme()
    },
    {
      label: texts.HomeNav.changeUser,
      icon: userIcon,
      onClick: (): void => navigate('/users')
    },
    {
      label: 'Refresh Plugins',
      icon: refreshIcon,
      onClick: () => updatePlugins()
    }
  ]

  const closeOption = [
    {
      label: texts.HomeNav.closeApp,
      icon: exitIcon,
      onClick: closeApp
    }
  ]

  const finalMenuOptions = activeUser ? [...options, ...closeOption] : closeOption

  const handleClick = (onClick: () => void): void => {
    toggleMenu()
    onClick()
  }

  return (
    <Cover
      visible={menuVisible}
      className={classNames(style.HomeNav, menuVisible ? style.visible : null)}
    >
      <ul>
        {finalMenuOptions.map((option) => (
          <li onClick={(): void => handleClick(option.onClick)} key={option.label}>
            <div className={style.icon} style={{ WebkitMaskImage: `url(${option.icon})` }} />
            <p>{option.label}</p>
          </li>
        ))}
      </ul>
    </Cover>
  )
}

export default HomeNav
