import classNames from 'classnames'
import Button from 'components/Button/Button'
import openWindow from 'functions/openWindow'

import downloadIcon from 'assets/download-icon.svg'
import useGlobalStore from 'store/useGlobalStore'
import usePersistStore from 'store/usePersistStore'
import Image from 'components/Image'
import logo from 'assets/logo.svg'

const HomeTopBar = (): JSX.Element => {
  const { toggleMenu, menuVisible } = useGlobalStore((state) => state)
  const { currentUser } = usePersistStore()

  const userActive = !!currentUser.id

  return (
    <div className="w-full h-14 flex justify-between relative shrink-0 items-center bg-default">
      <div className="[-webkit-app-region:drag] h-full w-full absolute" />
      {userActive && (
        <Button
          className="z-30"
          icon={downloadIcon}
          size="xs"
          theme="pure"
          onClick={() => openWindow({ component: 'Search', props: {} })}
        />
      )}
      <Image
        src={logo}
        className={classNames(
          'aspect-square absolute left-0 right-0 mx-auto h-full transition-transform duration-500 ease-default z-30',
          userActive ? 'scale-[200%]' : 'scale-[800%] translate-y-[20vh]'
        )}
      />
      <Button
        className="z-30 ml-auto"
        size="xs"
        active={menuVisible}
        theme="burger"
        onClick={(): void => toggleMenu()}
      />
    </div>
  )
}

export default HomeTopBar
