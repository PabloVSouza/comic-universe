import { ReactElement, useState } from 'react'
import style from './Settings.module.scss'

const Settings = (): ReactElement => {
  const [number, setNumber] = useState(0)

  return (
    <>
      <h3>Settings</h3>
      <p>{number}</p>
      <button onClick={(): void => setNumber(number + 1)}>Increase</button>
    </>
  )
}

const windowSettings = {
  windowProps: {
    className: style.Settings,
    titleBar: true,
    closeable: true,
    unique: true,
    title: 'App Settings'
  },
  initialStatus: {
    startPosition: 'center'
  }
} as TWindow

export default { Settings, ...windowSettings }
