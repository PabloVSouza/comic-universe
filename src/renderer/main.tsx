import { ReactNode } from 'react'
import { HashRouter } from 'react-router-dom'
import ReactDOM from 'react-dom/client'
import Routes from 'routes'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import 'css/main.css'
import usePersistStore from 'store/usePersistStore'
import classNames from 'classnames'
import { AlertProvider } from 'components/Alert'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'

import wallpaper from 'assets/wallpaper.webp'

interface Props {
  children: ReactNode
}

const queryClient = new QueryClient()

const Main = ({ children }: Props): JSX.Element => {
  const { theme } = usePersistStore()

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
  <QueryClientProvider client={queryClient}>
    <HashRouter>
      <I18nextProvider i18n={i18n}>
        <Main>
          <AlertProvider>
            <Routes />
          </AlertProvider>
        </Main>
      </I18nextProvider>
    </HashRouter>
  </QueryClientProvider>
)
