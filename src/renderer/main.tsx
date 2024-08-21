import { ReactNode, useEffect } from 'react'
import { HashRouter, useNavigate } from 'react-router-dom'
import ReactDOM from 'react-dom/client'
import Routes from 'routes'
import 'css/main.css'
import usePersistStore from 'store/usePersistStore'
import classNames from 'classnames'

import wallpaper from 'assets/wallpaper.webp'

interface Props {
  children: ReactNode
}

const Main = ({ children }: Props): JSX.Element => {
  const { theme } = usePersistStore()
  const navigate = useNavigate()

  useEffect(() => {
    const { on } = window.Electron.ipcRenderer
    on('changeUrl', (_event, url) => {
      navigate(url)
    })
  }, [])

  return (
    <div
      className={classNames(
        'h-[calc(100dvh)] w-screen bg-cover bg-center bg-no-repeat flex justify-center items-center relative overflow-hidden',
        theme
      )}
      style={{ backgroundImage: `url(${wallpaper}` }}
    >
      {children}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <HashRouter>
    <Main>
      <Routes />
    </Main>
  </HashRouter>
)
