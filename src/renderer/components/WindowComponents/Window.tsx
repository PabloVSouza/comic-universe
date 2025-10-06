import { useRef, useEffect, ReactElement } from 'react'
import classNames from 'classnames'
import { useWindowManagerStore } from 'store'
import { Button } from 'components/UiComponents'

const Window = ({
  children,
  closeable,
  className,
  contentClassName,
  id,
  maximizable,
  minimizable,
  resizable,
  title,
  titleBar,
  movable,
  unique,
  ...props
}: TWindowProps): ReactElement => {
  const refWindow = useRef<HTMLDivElement>(null)

  const {
    removeWindow,
    setIsFocused,
    setIsMoving,
    setIsResizing,
    setIsMaximized,
    setIsMinimized,
    setPosition,
    setSize,
    containerSize,
    currentWindows
  } = useWindowManagerStore()

  const windowObject = currentWindows.find((win) => win.id === id)

  if (windowObject) {
    const { windowStatus, initialStatus } = windowObject
    const { isMaximized, isFocused, top, left, width, height } = windowStatus
    const { startPosition } = initialStatus
    const position = { top: top, left: left }
    const size = { width: width, height: height }

    useEffect(() => {
      setIsFocused(id)
    }, [])

    const positions = {
      topLeft: {
        top: 0,
        left: 0
      },
      topCenter: {
        top: 0,
        left: containerSize.width / 2 - size.width / 2
      },
      topRight: {
        top: 0,
        left: containerSize.width - size.width
      },
      center: {
        top: containerSize.height / 2 - size.height / 2,
        left: containerSize.width / 2 - size.width / 2
      },
      centerLeft: {
        top: containerSize.height / 2 - size.height / 2,
        left: 0
      },
      centerRight: {
        top: containerSize.height / 2 - size.height / 2,
        left: containerSize.width - size.width
      },
      bottomLeft: {
        top: containerSize.height - size.height,
        left: 0
      },
      bottomCenter: {
        top: containerSize.height - size.height,
        left: containerSize.width / 2 - size.width / 2
      },
      bottomRight: {
        top: containerSize.height - size.height,
        left: containerSize.width - size.width
      }
    }

    const updateSize = () => {
      if (!height || !windowObject.windowProps.resizable) {
        let newHeight = Number(initialStatus.height ?? 300)
        let newWidth = Number(initialStatus.width ?? 500)

        if (initialStatus.height || initialStatus.width) {
          if (initialStatus.height) newHeight = Number(initialStatus.height)
          if (initialStatus.width) newWidth = Number(initialStatus.width)

          if (typeof initialStatus.height === 'string') {
            newHeight = (containerSize.height / 100) * Number(initialStatus.height.slice(0, -1))
          }

          if (typeof initialStatus.width === 'string') {
            newWidth = (containerSize.width / 100) * Number(initialStatus.width.slice(0, -1))
          }
        }
        setSize(id, { width: newWidth, height: newHeight })
      }
    }

    useEffect(() => {
      if (initialStatus.isMaximized) setIsMaximized(id, true)
      updateSize()
      if (!top || !left) {
        setPosition(id, {
          left: refWindow?.current?.offsetLeft ?? 0,
          top: refWindow?.current?.offsetTop ?? 0
        })

        if (startPosition && size.height && positions[startPosition]) {
          setPosition(id, positions[startPosition])
        }
      }
    }, [refWindow, size.height])

    const updatePosition = () => {
      if (startPosition && size.height && positions[startPosition]) {
        setPosition(id, positions[startPosition])
      }
    }

    useEffect(() => {
      if (!windowObject.windowProps.movable) updatePosition()
      if (!windowObject.windowProps.resizable) updateSize()
    }, [containerSize])

    const maximizedStyle = {
      left: '0.5%',
      top: '0.5%',
      width: '99%',
      height: '99%'
    }

    const maximizeWindow = (): void => {
      if (maximizable && !isMaximized) setIsMaximized(id, true)

      if (maximizable && isMaximized) setIsMaximized(id, false)
    }

    const zIndex = isFocused ? 51 : 50

    // Safari requires explicit units for positioning and sizing
    const finalStyle = isMaximized
      ? { ...maximizedStyle, zIndex }
      : {
          top: typeof position.top === 'number' ? `${position.top}px` : position.top,
          left: typeof position.left === 'number' ? `${position.left}px` : position.left,
          width: typeof size.width === 'number' ? `${size.width}px` : size.width,
          height: typeof size.height === 'number' ? `${size.height}px` : size.height,
          zIndex
        }

    const verifyAndSetMove = (): void => {
      if (movable) setIsMoving(id, true)
    }

    const verifyAndSetResize = (): void => {
      if (resizable) setIsResizing(id, true)
    }

    return (
      <div
        className="absolute min-h-24 min-w-24 rounded-lg bg-modal backdrop-blur-sm !overflow-hidden shadow-basic flex flex-col translate-3d-0"
        ref={refWindow}
        style={{ ...finalStyle, cursor: windowStatus.isMoving ? 'grabbing' : 'unset' }}
        onMouseDown={(): void => setIsFocused(id)}
        {...props}
      >
        {titleBar && (
          <div
            className="w-full h-8 bg-default shrink-0 shadow-basic relative"
            style={{ cursor: movable ? (windowStatus.isMoving ? 'grabbing' : 'grab') : 'unset' }}
          >
            <div
              className="w-full h-full flex items-center"
              onDoubleClick={maximizeWindow}
              onMouseDown={verifyAndSetMove}
            >
              {!!title && <p className="w-full text-center">{title}</p>}
            </div>
            <div className="absolute top-0 right-0 h-full [&>button:first-child]:!rounded-bl">
              {minimizable && (
                <Button theme="minimize" onClick={(): void => setIsMinimized(id, true)} />
              )}
              {closeable && <Button theme="close" onClick={(): void => removeWindow(id)} />}
            </div>
          </div>
        )}

        {!titleBar && (
          <div className="absolute flex top-0 right-0 [&>button]:!rounded-bl">
            {minimizable && (
              <Button theme="minimize" onClick={(): void => setIsMinimized(id, true)} />
            )}
            {closeable && <Button theme="close" onClick={(): void => removeWindow(id)} />}
          </div>
        )}

        <div className={classNames('flex-grow overflow-auto', className)}>{children}</div>
        {resizable && (
          <div className="absolute bottom-0 right-0">
            <Button theme="resize" onMouseDown={verifyAndSetResize} />
          </div>
        )}
      </div>
    )
  } else {
    return <></>
  }
}

export default Window
