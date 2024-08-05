import { useNavigate } from 'react-router-dom'

import classNames from 'classnames'

import Cover from 'components/Cover/Cover'

import openWindow from 'functions/openWindow'

import useLang from 'lang'

import useGlobalStore from 'store/useGlobalStore'

import usePersistStore from 'store/usePersistStore'

import style from './style.module.scss'

import infoIcon from 'assets/info.svg'
import settingsIcon from 'assets/settings.svg'
import darkmodeIcon from 'assets/darkmode.svg'
import userIcon from 'assets/user.svg'

const RightNav = (): JSX.Element => {
  const { menuVisible, toggleMenu } = useGlobalStore()
  const { switchTheme } = usePersistStore()

  const navigate = useNavigate()
  const texts = useLang()

  const options = [
    {
      label: texts.RightNav.about,
      icon: infoIcon,
      onClick: (): void => openWindow({ component: 'About', props: {} })
    },
    {
      label: texts.RightNav.settings,
      icon: settingsIcon,
      onClick: () => openWindow({ component: 'Settings', props: {} })
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
