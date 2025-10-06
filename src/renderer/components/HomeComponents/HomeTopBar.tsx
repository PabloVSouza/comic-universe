import { FC } from 'react'
import { logoIcon } from 'assets'
import classNames from 'classnames'
import { Button } from 'components/ui'
import { Image } from 'components/ui'
import useGlobalStore from 'store/useGlobalStore'
import usePersistSessionStore from 'store/usePersistSessionStore'

const HomeTopBar: FC = () => {
  const { toggleMenu, menuVisible } = useGlobalStore((state) => state)
  const { currentUser } = usePersistSessionStore()

  const userActive = !!currentUser.id

  return (
    <div className="w-full h-14 flex justify-between relative shrink-0 items-center bg-default">
      <div className="[-webkit-app-region:drag] h-full w-full absolute" />
      <Image
        src={logoIcon}
        className={classNames(
          'aspect-square absolute left-0 right-0 mx-auto h-full transition-transform duration-500 ease-default z-45',
          userActive ? 'scale-[200%]' : 'scale-[800%] translate-y-[20vh]'
        )}
      />
      <Button
        className="z-40 ml-auto"
        size="xs"
        active={menuVisible}
        theme="burger"
        onClick={(): void => toggleMenu()}
      />
    </div>
  )
}

export default HomeTopBar
