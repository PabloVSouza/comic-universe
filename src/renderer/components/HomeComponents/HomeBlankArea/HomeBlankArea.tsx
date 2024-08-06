import classNames from 'classnames'
import style from './HomeBlankArea.module.scss'
import Image from 'components/Image'

import logo from 'assets/logo.svg'

const HomeBlankArea = ({ active }: { active?: boolean }) => {
  return (
    <div className={classNames(style.HomeBlankArea, active ? style.Active : null)}>
      {/* <Image src={logo} className={style.icon} alt="App Icon" /> */}
    </div>
  )
}

export default HomeBlankArea
