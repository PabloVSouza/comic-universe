import useWindowManagerStore from 'store/useWindowManagerStore'
import { v4 as randomUUID } from 'uuid'
import PageList from 'pages'

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
      const window = {
        id: randomUUID(),
        component: PageList[component][component],
        componentProps: props,
        windowProps,
        windowStatus: windowStatus ?? {},
        initialStatus
      } as TWindow

      addWindow(window)
    }
  }
}

export default openWindow
