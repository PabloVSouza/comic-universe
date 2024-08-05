import useWindowManagerStore from 'store/useWindowManagerStore'
import { v4 as randomUUID } from 'uuid'
import PageList from 'pages/PageList'

const openWindow = ({
  component,
  props
}: {
  component: string
  props: { [key: string]: unknown }
}): void => {
  const { addWindow } = useWindowManagerStore.getState()

  if (PageList[component]) {
    const { windowProps, windowStatus, initialStatus } = PageList[component] as TWindow

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

export default openWindow
