import Image from 'components/Image/Image'

import style from './About.module.scss'

import appIcon from 'assets/icon.png'

const About = (): JSX.Element => {
  const { app } = window

  return (
    <>
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
    </>
  )
}

const windowSettings = {
  windowProps: {
    className: style.About,
    titleBar: true,
    closeable: true,
    movable: false,
    minimizable: false,
    maximizable: true,
    resizable: false,
    title: 'About This App'
  },
  initialStatus: {
    startPosition: 'center',
    width: 550,
    height: 350
  }
} as TWindow

export default { About, ...windowSettings }
