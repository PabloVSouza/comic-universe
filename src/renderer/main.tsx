import { ReactNode, useEffect } from 'react'
import { HashRouter } from 'react-router-dom'
import ReactDOM from 'react-dom/client'
import Routes from 'routes'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import 'css/main.css'
import usePersistStore from 'store/usePersistStore'
import { AlertProvider } from 'components/Alert'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n/index'

import wallpaper from 'assets/wallpaper.webp'

interface Props {
  children: ReactNode
}

const queryClient = new QueryClient()

// Apply theme immediately on app startup to prevent flash
const applyInitialTheme = () => {
  const savedTheme =
    localStorage.getItem('comic-universe-dev') || localStorage.getItem('comic-universe')
  if (savedTheme) {
    try {
      const parsed = JSON.parse(savedTheme)
      if (parsed.state?.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } catch (e) {
      // Default to dark theme if parsing fails
      document.documentElement.classList.add('dark')
    }
  } else {
    // Default to dark theme
    document.documentElement.classList.add('dark')
  }
}

// Apply theme immediately
applyInitialTheme()

const Main = ({ children }: Props): React.JSX.Element => {
  const { theme } = usePersistStore()

  // Apply theme class to document element for Tailwind CSS v4 dark mode
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <div
      className="h-[calc(100dvh)] w-screen bg-cover bg-center bg-no-repeat flex justify-center items-center relative overflow-hidden"
      style={{ backgroundImage: `url(${wallpaper})` }}
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
