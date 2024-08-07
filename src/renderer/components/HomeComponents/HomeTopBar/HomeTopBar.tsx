import classNames from 'classnames'
import Button from 'components/Button/Button'
import openWindow from 'functions/openWindow'
import style from './HomeTopBar.module.scss'

// import AppLogo from 'components/AppLogo'
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
    <div className={style.HomeNav}>
      <div className={style.draggableArea}></div>
      {userActive && (
        <div className={style.groupLeft}>
          <Button
            className={style.button}
            icon={downloadIcon}
            size="xs"
            theme="pure"
            onClick={() => openWindow({ component: 'Search', props: {} })}
          />
        </div>
      )}

      <Image
        src={logo}
        className={classNames(style.logoImage, userActive ? style.logoImageVisible : null)}
      />

      <div className={style.groupRight}>
        <Button
          className={style.button}
          size="xs"
          active={menuVisible}
          theme="burger"
          onClick={(): void => toggleMenu()}
        />
      </div>
    </div>
  )
}

export default HomeTopBar
