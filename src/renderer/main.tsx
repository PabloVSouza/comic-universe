import { ReactNode, useEffect } from 'react'
import { HashRouter, useNavigate } from 'react-router-dom'
import ReactDOM from 'react-dom/client'
import Routes from 'routes'
import usePersistStore from 'store/usePersistStore'
import 'scss/main/main.scss'
import themes from 'scss/main/themes.module.scss'

import classNames from 'classnames'

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

  return <div className={classNames(themes[theme], 'main')}>{children}</div>
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <HashRouter>
    <Main>
      <Routes />
    </Main>
  </HashRouter>
)
