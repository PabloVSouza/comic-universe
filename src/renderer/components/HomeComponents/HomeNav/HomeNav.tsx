import { useNavigate } from 'react-router-dom'
const { invoke } = window.Electron.ipcRenderer
import classNames from 'classnames'
import Cover from 'components/Cover/Cover'
import openWindow from 'functions/openWindow'
import Image from 'components/Image'

import useLang from 'lang'

import useGlobalStore from 'store/useGlobalStore'

import usePersistStore from 'store/usePersistStore'

import infoIcon from 'assets/info.svg'
import settingsIcon from 'assets/settings.svg'
import darkmodeIcon from 'assets/darkmode.svg'
import userIcon from 'assets/user.svg'
import exitIcon from 'assets/exit-door.svg'

const HomeNav = (): JSX.Element => {
  const { menuVisible, toggleMenu } = useGlobalStore()
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
    <Cover visible={menuVisible}>
      <ul
        className={classNames(
          'transition-move-fade bg-default h-full w-52 duration-500 ease-default ml-auto mb-auto pt-12 flex gap-1 flex-col',
          menuVisible ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {finalMenuOptions.map((option) => (
          <li
            className="group h-12 bg-default flex items-center cursor-pointer hover:bg-light hover:text-text-oposite"
            onClick={(): void => handleClick(option.onClick)}
            key={option.label}
          >
            <Image
              className="bg-light aspect-square h-full p-3 group-hover:bg-text-oposite"
              src={option.icon}
              svg
            />
            <p>{option.label}</p>
          </li>
        ))}
      </ul>
    </Cover>
  )
}

export default HomeNav
