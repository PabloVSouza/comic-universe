import { MutableRefObject, ReactElement, ReactNode, useRef, useEffect } from 'react'
import * as Portals from 'react-reverse-portal'
import classNames from 'classnames'
// import MinimizedBar from 'components/WindowComponents/MinimizedBar'
import Window from 'components/WindowComponents/Window'
import useWindowManagerStore from 'store/useWindowManagerStore'

type TWindowManager = {
  children: ReactNode
  className?: string
}

const WindowManager = ({ children, className }: TWindowManager): ReactElement => {
  const containerRef = useRef() as MutableRefObject<HTMLDivElement> | null
  const { currentWindows, portalsRef, mouseCapture, removeMovingResizing, setContainerSize } =
    useWindowManagerStore()

  const updateSize = (): void => {
    const height = containerRef?.current.offsetHeight ?? 0
    const width = containerRef?.current.offsetWidth ?? 0
    setContainerSize({ height, width })
  }

  useEffect(() => {
    updateSize()

    window.addEventListener('resize', updateSize)
    return () => {
      window.removeEventListener('resize', updateSize)
    }
  }, [containerRef])

  // const MinimizedWindows = currentWindows.filter((window) => window.windowStatus.isMinimized)
  const ActiveWindows = currentWindows.filter((window) => !window.windowStatus.isMinimized)

  return (
    <div
      className={classNames('relative grow h-px w-full', className)}
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
        const props = { ...windowProps, id }
        return (
          <Window key={window.id} {...props}>
            <Portals.OutPortal node={portalsRef[window.id]} key={window.id} />
          </Window>
        )
      })}
      {children}
      {/* <MinimizedBar MinimizedList={MinimizedWindows} /> */}
    </div>
  )
}

export default WindowManager
