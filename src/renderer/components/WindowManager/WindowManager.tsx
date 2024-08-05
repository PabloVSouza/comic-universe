import { MutableRefObject, ReactElement, ReactNode, useRef, useEffect } from 'react'
import * as Portals from 'react-reverse-portal'

import MinimizedBar from './MinimizedBar/MinimizedBar'
import Window from './Window/Window'

import useWindowManagerStore from 'store/useWindowManagerStore'

import style from './WindowManager.module.scss'

type TWindowManager = {
  children: ReactNode
}

const WindowManager = ({ children }: TWindowManager): ReactElement => {
  const containerRef = useRef() as MutableRefObject<HTMLDivElement> | null
  const {
    currentWindows,
    portalsRef,
    mouseCapture,
    removeMovingResizing,
    containerSize,
    setContainerSize
  } = useWindowManagerStore()

  const updateSize = (): void => {
    const height = containerRef?.current.offsetHeight ?? 0
    const width = containerRef?.current.offsetWidth ?? 0
    setContainerSize({ height, width })
  }

  useEffect(() => {
    updateSize()
  }, [containerRef])

  useEffect(() => {
    window.addEventListener('resize', updateSize)
    return () => {
      window.removeEventListener('resize', updateSize)
    }
  }, [])

  const MinimizedWindows = currentWindows.filter((window) => window.windowStatus.isMinimized)
  const ActiveWindows = currentWindows.filter((window) => !window.windowStatus.isMinimized)

  return (
    <div
      className={style.WindowManager}
      ref={containerRef}
      onMouseMoveCapture={mouseCapture}
      onMouseUp={removeMovingResizing}
      onMouseLeave={removeMovingResizing}
    >
      {currentWindows.map((window) => {
        return (
          <Portals.InPortal key={window.id} node={portalsRef[window.id]}>
            <window.component {...window.componentProps} />
          </Portals.InPortal>
        )
      })}

      {ActiveWindows.map((window) => {
        const { windowProps, id } = window
        const props = { ...windowProps, containerSize, id }
        return (
          <Window key={window.id} {...props}>
            <Portals.OutPortal node={portalsRef[window.id]} key={window.id} />
          </Window>
        )
      })}
      {children}
      <MinimizedBar MinimizedList={MinimizedWindows} />
    </div>
  )
}

export default WindowManager
