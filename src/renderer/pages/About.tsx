import Image from 'components/Image'

import appIcon from 'assets/icon.svg'

const About = (): JSX.Element => {
  const { app } = window

  return (
    <>
      <Image src={appIcon} className="w-1/3 aspect-square flex-shrink-0" />
      <div className="flex flex-grow h-full flex-col items-center justify-center text-center gap-1">
        <h1 className="text-3xl">Comic Universe</h1>
        <p>Ver: {app.version}</p>
        <p>Author: {app.author}</p>
        <p>License: {app.license}</p>
        {app.description.split('. ').map((description) => (
          <p key={description}>{description}.</p>
        ))}
        <a href={app.repository} target="_blank" rel="noreferrer" className="mt-2">
          <u>Github Repository</u>
        </a>
      </div>
    </>
  )
}

const windowSettings = {
  windowProps: {
    className: 'flex-grow',
    unique: true,
    closeable: true,
    title: 'About This App',
    contentClassName: 'flex-grow flex h-full w-full items-center justify-center p-8'
  },
  initialStatus: {
    startPosition: 'center',
    width: 550,
    height: 350
  }
} as TWindow

export default { About, ...windowSettings }
