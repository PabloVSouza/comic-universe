import { FC, ReactNode, useEffect } from 'react'
import { I18nextProvider } from 'react-i18next'
import { HashRouter } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import ReactDOM from 'react-dom/client'
import Routes from 'routes'
import 'css/main.css'
import { AlertProvider } from 'components/Alert'
import UpdateNotification from 'components/UpdateNotification'
import WallpaperRenderer from 'components/WallpaperRenderer'
import { useUserSettings } from 'hooks/useUserSettings'
import usePersistStore from 'store/usePersistStore'
import i18n from './i18n/index'

interface Props {
  children: ReactNode
}

const queryClient = new QueryClient()

const applyInitialTheme = () => {
  document.documentElement.classList.add('dark')
}

applyInitialTheme()

const Main: FC<Props> = ({ children }) => {
  const { theme } = usePersistStore()
  const { effectiveTheme, currentWallpaper } = useUserSettings()

  useEffect(() => {
    const themeToApply = effectiveTheme || theme?.theme

    if (themeToApply) {
      if (themeToApply === 'dark') {
        document.documentElement.classList.add('dark')
      } else if (themeToApply === 'light') {
        document.documentElement.classList.remove('dark')
      } else if (themeToApply === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    }
  }, [effectiveTheme, theme])

  useEffect(() => {
    document.documentElement.classList.add('transition-colors', 'duration-300', 'ease-default')
  }, [])

  return (
    <>
      <WallpaperRenderer wallpaper={currentWallpaper} />
      <div className="main-container h-[calc(100dvh)] w-screen flex justify-center items-center relative overflow-hidden transition-colors duration-300 ease-default">
        {children}
      </div>
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <HashRouter>
      <I18nextProvider i18n={i18n}>
        <Main>
          <AlertProvider>
            <UpdateNotification />
            <Routes />
          </AlertProvider>
        </Main>
      </I18nextProvider>
    </HashRouter>
  </QueryClientProvider>
)
