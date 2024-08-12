import Button from 'components/Button/Button'

import style from './style.module.scss'

import downloadIcon from 'assets/download-icon.svg'
import useGlobalStore from 'store/useGlobalStore'

const HomeTopBar = (): JSX.Element => {
  const { toggleMenu, menuVisible } = useGlobalStore((state) => state)

  return (
    <div className={style.topBar}>
      <div className={style.groupLeft}>
        <Button
          className={style.button}
          icon={downloadIcon}
          size="xs"
          theme="pure"
          to="/?modal=search"
        />
      </div>
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
