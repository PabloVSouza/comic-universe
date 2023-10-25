import { useNavigate } from 'react-router-dom'
const { invoke } = window.Electron.ipcRenderer

import classNames from 'classnames'

import Cover from 'components/Cover'

import useLang from 'lang'

import useGlobalStore from 'store/useGlobalStore'

import usePersistStore from 'store/usePersistStore'

import style from './style.module.scss'

import infoIcon from 'assets/info.svg'
import settingsIcon from 'assets/settings.svg'
import darkmodeIcon from 'assets/darkmode.svg'
import userIcon from 'assets/user.svg'
import exitIcon from 'assets/exit-door.svg'

const RightNav = (): JSX.Element => {
  const { menuVisible, toggleMenu } = useGlobalStore()
  const { switchTheme } = usePersistStore()

  const navigate = useNavigate()
  const texts = useLang()

  const closeApp = (): void => {
    invoke('closeWindow')
  }

  const options = [
    {
      label: texts.RightNav.about,
      icon: infoIcon,
      onClick: (): void => navigate('/?modal=about')
    },
    {
      label: texts.RightNav.settings,
      icon: settingsIcon,
      onClick: (): void => navigate(`/?modal=message&text=${texts.General.inDevelopment}`)
    },
    {
      label: texts.RightNav.darkMode,
      icon: darkmodeIcon,
      onClick: (): void => switchTheme()
    },
    {
      label: texts.RightNav.changeUser,
      icon: userIcon,
      onClick: (): void => navigate('/users')
    },
    {
      label: texts.RightNav.closeApp,
      icon: exitIcon,
      onClick: closeApp
    }
  ]

  const handleClick = (onClick: () => void): void => {
    toggleMenu()
    onClick()
  }

  return (
    <Cover
      visible={menuVisible}
      className={classNames(style.RightNav, menuVisible ? style.visible : null)}
    >
      <ul>
        {options.map((option) => (
          <li onClick={(): void => handleClick(option.onClick)} key={option.label}>
            <div className={style.icon} style={{ WebkitMaskImage: `url(${option.icon})` }} />
            <p>{option.label}</p>
          </li>
        ))}
      </ul>
    </Cover>
  )
}

export default RightNav
