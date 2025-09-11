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
import UpdateNotification from 'components/UpdateNotification'
import { useUserSettings } from 'hooks/useUserSettings'

interface Props {
  children: ReactNode
}

const queryClient = new QueryClient()

// Apply theme immediately on app startup to prevent flash
const applyInitialTheme = () => {
  // For now, default to dark theme to prevent flash
  // The actual theme will be applied by the Main component once usePersistStore is initialized
  document.documentElement.classList.add('dark')
}

// Apply theme immediately
applyInitialTheme()

const Main = ({ children }: Props): React.JSX.Element => {
  const { theme } = usePersistStore()
  const { userSettings, effectiveTheme } = useUserSettings()

  // Apply theme class to document element for Tailwind CSS v4 dark mode
  useEffect(() => {
    const themeToApply = effectiveTheme || theme?.theme

    if (themeToApply) {
      if (themeToApply === 'dark') {
        document.documentElement.classList.add('dark')
      } else if (themeToApply === 'light') {
        document.documentElement.classList.remove('dark')
      } else if (themeToApply === 'auto') {
        // Auto theme based on system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    }
  }, [effectiveTheme, theme])

  // Add transition classes once on mount
  useEffect(() => {
    document.documentElement.classList.add('transition-colors', 'duration-300', 'ease-default')
  }, [])

  return (
    <div className="main-container h-[calc(100dvh)] w-screen bg-cover bg-center bg-no-repeat flex justify-center items-center relative overflow-hidden transition-colors duration-300 ease-default">
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
            <UpdateNotification />
            <Routes />
          </AlertProvider>
        </Main>
      </I18nextProvider>
    </HashRouter>
  </QueryClientProvider>
)
