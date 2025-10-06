import { v4 as randomUUID } from 'uuid'
import * as WindowList from 'windows'
import useWindowManagerStore from 'store/useWindowManagerStore'
import i18n from '../i18n'

export const updateWindowTitles = (): void => {
  const { currentWindows, updateWindowProps } = useWindowManagerStore.getState()

  const titleMap: { [key: string]: string } = {
    Settings: 'Settings.windowTitle',
    About: 'HomeNav.about',
    Search: 'SearchComic.windowTitle',
    Users: 'Settings.options.userLabel'
  }

  currentWindows.forEach((window) => {
    const componentName = window.component.name
    const translationKey = titleMap[componentName]

    if (translationKey && window.windowProps.title) {
      const translatedTitle = i18n.t(translationKey)
      if (window.windowProps.title !== translatedTitle) {
        updateWindowProps(window.id, { title: translatedTitle })
      }
    }
  })
}

const openWindow = ({
  component,
  props
}: {
  component: string
  props: { [key: string]: unknown }
}): void => {
  const { addWindow, currentWindows } = useWindowManagerStore.getState()

  if (WindowList[component]) {
    const { windowProps, windowStatus, initialStatus } = WindowList[component] as TWindow

    const alreadyExist = currentWindows.find((window) => window.component.name === component)

    const shouldCreate = !(alreadyExist && windowProps.unique)

    if (shouldCreate) {
      // Apply dynamic translations to window title
      const translatedWindowProps = { ...windowProps }
      if (translatedWindowProps.title) {
        // Map component names to translation keys
        const titleMap: { [key: string]: string } = {
          Settings: 'Settings.windowTitle',
          About: 'HomeNav.about',
          Search: 'SearchComic.windowTitle',
          Users: 'Settings.options.userLabel'
        }

        const translationKey = titleMap[component]
        if (translationKey) {
          const translatedTitle = i18n.t(translationKey)
          translatedWindowProps.title = translatedTitle
        }
      }

      const window = {
        id: randomUUID(),
        component: WindowList[component][component],
        componentProps: props,
        windowProps: translatedWindowProps,
        windowStatus: windowStatus ?? {},
        initialStatus
      } as TWindow

      addWindow(window)
    }
  }
}

export default openWindow
