import Window from 'components/Window/Window'
import Image from 'components/Image/Image'

import style from './style.module.scss'

import appIcon from 'assets/icon.png'

const ModalAbout = (): JSX.Element => {
  const { app } = window

  return (
    <Window close to={'/'} className={style.About} contentClassName={style.content}>
      <Image src={appIcon} className={style.icon} />
      <div className={style.texts}>
        <h1>Comic Universe</h1>
        <p>Ver: {app.version}</p>
        <p>Author: {app.author}</p>
        <p>License: {app.license}</p>
        {app.description.split('. ').map((description) => (
          <p key={description}>{description}.</p>
        ))}
        <a href={app.repository} target="_blank" rel="noreferrer">
          <u>Github Repository</u>
        </a>
      </div>
    </Window>
  )
}

export default ModalAbout
