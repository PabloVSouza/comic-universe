import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import useApi from 'api'
import usePersistSessionStore from 'store/usePersistSessionStore'
import usePersistStore from 'store/usePersistStore'
import wallpaperManager from 'renderer-utils/wallpaperManager'

export const useUserSettings = () => {
  const { invoke } = useApi()
  const { i18n } = useTranslation()
  const { currentUser } = usePersistSessionStore()
  const { theme: appTheme, language: appLanguage } = usePersistStore()

  const { data: userSettings } = useQuery({
    queryKey: ['userSettings', currentUser.id],
    queryFn: async () => {
      if (currentUser.id) {
        return await invoke('dbGetUserSettings', { userId: currentUser.id })
      }
      return null
    },
    enabled: !!currentUser.id,
    initialData: null
  })

  // Apply theme settings
  useEffect(() => {
    if (userSettings?.displayPreferences?.theme) {
      const userTheme = userSettings.displayPreferences.theme
      let themeToApply = appTheme.theme

      if (userTheme !== 'inherit') {
        themeToApply = userTheme
      }

      // Apply theme to document
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
  }, [userSettings?.displayPreferences?.theme, appTheme.theme])

  // Apply language settings
  useEffect(() => {
    let languageToApply = appLanguage.language

    if (userSettings?.appPreferences?.language) {
      const userLanguage = userSettings.appPreferences.language
      if (userLanguage !== 'inherit') {
        languageToApply = userLanguage
      }
    }

    if (i18n.language !== languageToApply) {
      i18n.changeLanguage(languageToApply)
    }
  }, [userSettings?.appPreferences?.language, appLanguage.language, i18n])

  // Apply wallpaper settings
  useEffect(() => {
    const mainContainer = document.querySelector('.main-container')
    if (!mainContainer) return

    const applyWallpaper = async () => {
      if (userSettings?.displayPreferences?.wallpaper) {
        const wallpaper = userSettings.displayPreferences.wallpaper
        const wallpaperUrl = await wallpaperManager.getWallpaperUrl(wallpaper)
        ;(mainContainer as HTMLElement).style.backgroundImage = `url(${wallpaperUrl})`
      } else {
        // Use default wallpaper when no custom wallpaper is selected
        const defaultWallpaperUrl = await wallpaperManager.getWallpaperUrl('default.webp')
        ;(mainContainer as HTMLElement).style.backgroundImage = `url(${defaultWallpaperUrl})`
      }
    }

    applyWallpaper()
  }, [userSettings?.displayPreferences?.wallpaper])

  return {
    userSettings,
    isUserThemeActive: userSettings?.displayPreferences?.theme !== 'inherit',
    isUserLanguageActive: userSettings?.appPreferences?.language !== 'inherit',
    effectiveTheme:
      userSettings?.displayPreferences?.theme === 'inherit'
        ? appTheme.theme
        : userSettings?.displayPreferences?.theme,
    effectiveLanguage:
      userSettings?.appPreferences?.language === 'inherit'
        ? appLanguage.language
        : userSettings?.appPreferences?.language
  }
}

export default useUserSettings
