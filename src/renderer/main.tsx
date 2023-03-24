import { ReactNode } from 'react'
import { HashRouter } from 'react-router-dom'
import ReactDOM from 'react-dom/client'
import Routes from 'routes'
import Loading from 'components/Loading'
import usePersistStore from 'store/usePersistStore'

import style from 'scss/main/style.module.scss'
import themes from 'scss/main/themes.module.scss'

import classNames from 'classnames'

interface Props {
  children: ReactNode
}

const Main = ({ children }: Props): JSX.Element => {
  const { theme } = usePersistStore()
  return <div className={classNames(themes[theme], style.main)}>{children}</div>
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <HashRouter>
    <Main>
      <Loading />
      <Routes />
    </Main>
  </HashRouter>
)
