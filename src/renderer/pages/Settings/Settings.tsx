import { ReactElement, useState } from 'react'
import style from './Settings.module.scss'

const Settings = ({ cliente }: { cliente: string }): ReactElement => {
  const [number, setNumber] = useState(0)

  return (
    <>
      <h1>{cliente}</h1>
      <div className={style.FormArea}></div>
      <div className={style.FormArea}></div>
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
    movable: false,
    minimizable: false,
    maximizable: true,
    resizable: true,
    title: 'Cadastro de Clientes'
  },
  initialStatus: {
    startPosition: 'center'
  }
} as TWindow

export default { Settings, ...windowSettings }
