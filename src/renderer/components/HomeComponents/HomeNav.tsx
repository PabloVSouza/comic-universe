import useApi from 'api'
import classNames from 'classnames'
import Cover from 'components/Cover'
import openWindow from 'functions/openWindow'
import Image from 'components/Image'
import { useTranslation } from 'react-i18next'
import useGlobalStore from 'store/useGlobalStore'
import usePersistStore from 'store/usePersistStore'
import usePersistSessionStore from 'store/usePersistSessionStore'

import infoIcon from 'assets/info.svg'
import settingsIcon from 'assets/settings.svg'
import userIcon from 'assets/user.svg'
import exitIcon from 'assets/exit-door.svg'

const HomeNav = (): React.JSX.Element => {
  const { invoke } = useApi()
  const { menuVisible, toggleMenu } = useGlobalStore()
  const { switchTheme } = usePersistStore()
  const { currentUser, setCurrentUser } = usePersistSessionStore()

  const { t } = useTranslation()
  const activeUser = !!currentUser.id

  const closeApp = (): void => {
    setCurrentUser({} as IUser)
    invoke('closeWindow')
  }

  const options = [
    {
      label: t('HomeNav.about'),
      icon: infoIcon,
      onClick: (): void => openWindow({ component: 'Settings', props: { initialTab: 'about' } })
    },
    {
      label: t('HomeNav.settings'),
      icon: settingsIcon,
      onClick: () => openWindow({ component: 'Settings', props: {} })
    },

    {
      label: t('HomeNav.changeUser'),
      icon: userIcon,
      onClick: (): void => setCurrentUser({} as IUser)
    }
  ]

  const closeOption = [
    {
      label: t('HomeNav.closeApp'),
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
          'transition-move-fade bg-default h-full w-52 duration-500 ease-default ml-auto mb-auto pt-14 flex gap-px flex-col',
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
              className="bg-text-default aspect-square h-full p-3 group-hover:bg-text-oposite"
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
