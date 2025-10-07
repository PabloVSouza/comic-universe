import * as Portals from 'react-reverse-portal'
import { create } from 'zustand'

type TuseWindowManagerStore = {
  currentWindows: TWindow[]
  portalsRef: { [windowId: string]: Portals.HtmlPortalNode }
  containerSize: { height: number; width: number }
  addWindow: (window: TWindow) => void
  removeWindow: (id: string) => void
  setIsFocused: (id: string) => void
  setIsMoving: (id: string, param: boolean) => void
  setIsResizing: (id: string, param: boolean) => void
  setIsMaximized: (id: string, param: boolean) => void
  setIsMinimized: (id: string, param: boolean) => void
  setContainerSize: (size: { width: number; height: number }) => void
  setPosition: (id: string, param: { top: number; left: number }) => void
  setSize: (id: string, param: { width: number; height: number }) => void
  changeWindowParam: (id: string, param: { [key: string]: unknown }) => void
  updateWindowProps: (id: string, props: Partial<TWindowProps>) => void
  adjustWindowPositions: () => void
  removeMovingResizing: () => void
  mouseCapture: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}

const useWindowManagerStore = create<TuseWindowManagerStore>((set) => ({
  currentWindows: [],
  focusedWindow: '',
  portalsRef: {},
  containerSize: { width: 0, height: 0 },

  addWindow: (window): void => {
    set((state: TuseWindowManagerStore) => {
      const windowWithOriginalSize = {
        ...window,
        originalContainerSize: { ...state.containerSize }
      }

      state.currentWindows.push(windowWithOriginalSize)
      state.portalsRef[window.id] = Portals.createHtmlPortalNode({
        attributes: {
          class: window.windowProps.contentClassName ?? ''
        }
      })
      return { ...state }
    })
  },

  removeWindow: (id): void => {
    set((state) => {
      state.currentWindows.splice(
        state.currentWindows.findIndex((val) => val.id === id),
        1
      )

      delete state.portalsRef[id]

      return { ...state }
    })
  },

  setIsFocused: (id): void => {
    set((state) => {
      const window = state.currentWindows.find((val) => val.id === id)
      state.currentWindows.forEach((val) => (val.windowStatus.isFocused = false))

      if (window) window.windowStatus.isFocused = true

      return { ...state }
    })
  },

  setIsMoving: (id, param): void => {
    set((state) => {
      const window = state.currentWindows.find((val) => val.id === id)

      if (window && !window.windowStatus.isMaximized) window.windowStatus.isMoving = param

      return { ...state }
    })
  },

  setIsResizing: (id, param): void => {
    set((state) => {
      const window = state.currentWindows.find((val) => val.id === id)

      if (window && !window.windowStatus.isMaximized) window.windowStatus.isResizing = param

      return { ...state }
    })
  },

  setIsMaximized: (id, param): void => {
    set((state) => {
      const window = state.currentWindows.find((val) => val.id === id)
      if (window) window.windowStatus.isMaximized = param
      return { ...state }
    })
  },

  setIsMinimized: (id, param): void => {
    set((state) => {
      const window = state.currentWindows.find((val) => val.id === id)

      if (window) window.windowStatus.isMinimized = param

      return { ...state }
    })
  },

  setContainerSize: (size): void => {
    set((state) => {
      const oldSize = state.containerSize
      state.containerSize = size

      if (oldSize.width !== size.width || oldSize.height !== size.height) {
        setTimeout(() => {
          const { adjustWindowPositions } = useWindowManagerStore.getState()
          adjustWindowPositions()
        }, 0)
      }

      return { ...state }
    })
  },

  setPosition: (id, param): void => {
    set((state) => {
      const window = state.currentWindows.find((val) => val.id === id)
      const { left, top } = param

      if (window) {
        window.windowStatus.top = top
        window.windowStatus.left = left
      }

      return { ...state }
    })
  },

  setSize: (id, param): void => {
    set((state) => {
      const window = state.currentWindows.find((val) => val.id === id)

      const { width, height } = param

      if (window) {
        window.windowStatus.width = width
        window.windowStatus.height = height
      }
      return { ...state }
    })
  },

  changeWindowParam: (id, param): void => {
    const { currentWindows } = useWindowManagerStore.getState()
    const windowObject = currentWindows.find((win) => win.id === id)
    if (windowObject) {
      windowObject.windowStatus = { ...windowObject?.windowStatus, ...param }
    }

    set((state) => ({ ...state, currentWindows: currentWindows }))
  },

  updateWindowProps: (id, props): void => {
    set((state) => {
      const updatedWindows = state.currentWindows.map((window) => {
        if (window.id === id) {
          return {
            ...window,
            windowProps: {
              ...window.windowProps,
              ...props
            }
          }
        }
        return window
      })
      return { ...state, currentWindows: updatedWindows }
    })
  },

  adjustWindowPositions: (): void => {
    set((state) => {
      const { currentWindows, containerSize } = state
      const updatedWindows = currentWindows.map((window) => {
        const { top, left, width, height } = window.windowStatus
        const { isMaximized } = window.windowStatus
        const { initialStatus } = window

        if (isMaximized) {
          return window
        }

        const isOutsideBounds =
          left + width > containerSize.width ||
          left < 0 ||
          top + height > containerSize.height ||
          top < 0

        if (!isOutsideBounds) {
          return window
        }

        let newTop = top
        let newLeft = left

        if (window.originalContainerSize) {
          const { width: oldWidth, height: oldHeight } = window.originalContainerSize
          const widthRatio = containerSize.width / oldWidth
          const heightRatio = containerSize.height / oldHeight

          const proportionalLeft = left * widthRatio
          const proportionalTop = top * heightRatio

          if (
            proportionalLeft >= 0 &&
            proportionalLeft + width <= containerSize.width &&
            proportionalTop >= 0 &&
            proportionalTop + height <= containerSize.height
          ) {
            newLeft = proportionalLeft
            newTop = proportionalTop
            console.log(
              `Using proportional position for ${window.component.name}: (${left}, ${top}) -> (${newLeft}, ${newTop})`
            )
          } else {
            newLeft =
              initialStatus.startPosition === 'center'
                ? Math.max(0, (containerSize.width - width) / 2)
                : Number(initialStatus.left) || 0
            newTop =
              initialStatus.startPosition === 'center'
                ? Math.max(0, (containerSize.height - height) / 2)
                : Number(initialStatus.top) || 0
            console.log(
              `Using fallback position for ${window.component.name}: (${left}, ${top}) -> (${newLeft}, ${newTop})`
            )
          }
        } else {
          newLeft =
            initialStatus.startPosition === 'center'
              ? Math.max(0, (containerSize.width - width) / 2)
              : Number(initialStatus.left) || 0
          newTop =
            initialStatus.startPosition === 'center'
              ? Math.max(0, (containerSize.height - height) / 2)
              : Number(initialStatus.top) || 0
          console.log(
            `Using fallback position for ${window.component.name}: (${left}, ${top}) -> (${newLeft}, ${newTop})`
          )
        }

        newLeft = Math.max(0, Math.min(newLeft, containerSize.width - width))
        newTop = Math.max(0, Math.min(newTop, containerSize.height - height))

        return {
          ...window,
          windowStatus: {
            ...window.windowStatus,
            top: newTop,
            left: newLeft
          }
        }
      })

      return { ...state, currentWindows: updatedWindows }
    })
  },

  mouseCapture: (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    const { currentWindows, containerSize, setPosition, setSize } = useWindowManagerStore.getState()
    const { movementY, movementX } = e
    const windowMoving = currentWindows.find((val) => val.windowStatus.isMoving)
    const windowResizing = currentWindows.find((val) => val.windowStatus.isResizing)

    if (windowMoving) {
      const { isMaximized, width, height, top, left } = windowMoving.windowStatus
      const { movable } = windowMoving.windowProps
      const areaWidth = containerSize.width
      const areaHeight = containerSize.height
      if (!isMaximized && movable && areaHeight && areaWidth) {
        let newTop = top + movementY
        let newLeft = left + movementX
        if (newTop + height > areaHeight) newTop = areaHeight - height
        if (newLeft + width > areaWidth) newLeft = areaWidth - width
        if (newTop < 0) newTop = 0
        if (newLeft < 0) newLeft = 0
        setPosition(windowMoving.id, { top: newTop, left: newLeft })
      }
    }

    if (windowResizing) {
      const { isResizing, isMaximized, width, height } = windowResizing.windowStatus
      const { resizable } = windowResizing.windowProps

      if (!isMaximized && resizable && isResizing) {
        const newWidth = width + movementX
        const newHeight = height + movementY
        setSize(windowResizing.id, { width: newWidth, height: newHeight })
      }
    }
  },

  removeMovingResizing: (): void => {
    const { currentWindows, setIsMoving, setIsResizing } = useWindowManagerStore.getState()
    const movingWindow = currentWindows.find((window) => window.windowStatus.isMoving)
    const resizingWindow = currentWindows.find((window) => window.windowStatus.isResizing)

    if (movingWindow) setIsMoving(movingWindow.id, false)
    if (resizingWindow) setIsResizing(resizingWindow.id, false)
  }
}))

export default useWindowManagerStore
