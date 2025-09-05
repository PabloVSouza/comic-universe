import useWindowManagerStore from 'store/useWindowManagerStore'
import { v4 as randomUUID } from 'uuid'
import PageList from 'pages'
import i18n from '../i18n'

// Function to update window titles when language changes
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
        console.log(
          `Updating ${componentName} title: "${window.windowProps.title}" -> "${translatedTitle}"`
        )
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

  if (PageList[component]) {
    const { windowProps, windowStatus, initialStatus } = PageList[component] as TWindow

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
          console.log(
            `Translating ${component} title: "${translatedWindowProps.title}" -> "${translatedTitle}"`
          )
          translatedWindowProps.title = translatedTitle
        }
      }

      const window = {
        id: randomUUID(),
        component: PageList[component][component],
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
