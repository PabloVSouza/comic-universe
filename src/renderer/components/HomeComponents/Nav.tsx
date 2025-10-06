import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { infoIcon, settingsIcon, userIcon, exitDoorIcon, logoutIcon, pluginIcon } from 'assets'
import classNames from 'classnames'
import { openWindow } from 'functions'
import { useApi, useEnvironment } from 'hooks'
import { useGlobalStore, usePersistSessionStore } from 'store'
import { Cover, Image } from 'components/ui'

const Nav: FC = () => {
  const { invoke } = useApi()
  const { menuVisible, toggleMenu } = useGlobalStore()
  const { isWebUI } = useEnvironment()

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
      label: t('HomeNav.userSettings'),
      icon: userIcon,
      onClick: (): void => openWindow({ component: 'Settings', props: { initialTab: 'user' } })
    },
    {
      label: t('HomeNav.plugins'),
      icon: pluginIcon,
      onClick: (): void => openWindow({ component: 'Settings', props: { initialTab: 'plugins' } })
    },
    {
      label: t('HomeNav.changeUser'),
      icon: logoutIcon,
      onClick: (): void => setCurrentUser({} as IUser)
    }
  ]

  const closeOption = [
    {
      label: t('HomeNav.closeApp'),
      icon: exitDoorIcon,
      onClick: closeApp
    }
  ]

  const finalMenuOptions = activeUser
    ? [...options, ...(isWebUI ? [] : closeOption)]
    : isWebUI
      ? []
      : closeOption

  const handleClick = (onClick: () => void): void => {
    toggleMenu()
    onClick()
  }

  return (
    <Cover visible={menuVisible} className="z-40" onClick={toggleMenu}>
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

export default Nav
