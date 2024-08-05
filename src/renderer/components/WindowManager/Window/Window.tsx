import { useRef, useEffect, ReactElement, useMemo } from 'react'
import useWindowManagerStore from 'store/useWindowManagerStore'
import style from './Window.module.scss'
import Button from 'components/Button/Button'
import classNames from 'classnames'

const Window = ({
  containerSize,
  children,
  closeable,
  className,
  id,
  maximizable,
  minimizable,
  resizable,
  title,
  titleBar,
  movable,
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

    const positions = useMemo(
      () => ({
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
      }),
      [size, containerSize]
    )

    useEffect(() => {
      if (initialStatus.isMaximized) setIsMaximized(id, true)
      if (!height) {
        let newHeight = 300
        let newWidth = 500
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

    const finalStyle = isMaximized
      ? { ...maximizedStyle, zIndex }
      : { ...position, ...size, zIndex }

    const verifyAndSetMove = (): void => {
      if (movable) setIsMoving(id, true)
    }

    const verifyAndSetResize = (): void => {
      if (resizable) setIsResizing(id, true)
    }

    return (
      <div
        className={style.Window}
        ref={refWindow}
        style={finalStyle}
        onMouseDown={(): void => setIsFocused(id)}
        {...props}
      >
        {titleBar && (
          <div className={style.titleBar}>
            <div
              className={style.movableArea}
              onDoubleClick={maximizeWindow}
              onMouseDown={verifyAndSetMove}
            >
              {!!title && <p className={style.title}>{title}</p>}
            </div>
            <div className={style.buttonArea}>
              {minimizable && (
                <Button theme="minimize" onClick={(): void => setIsMinimized(id, true)} />
              )}
              {closeable && <Button theme="close" onClick={(): void => removeWindow(id)} />}
            </div>
          </div>
        )}

        {!titleBar && (
          <div className={style.buttonArea}>
            {minimizable && (
              <Button theme="minimize" onClick={(): void => setIsMinimized(id, true)} />
            )}
            {closeable && <Button theme="close" onClick={(): void => removeWindow(id)} />}
          </div>
        )}

        <div className={classNames(className, style.content)}>{children}</div>
        {resizable && (
          <div className={style.resizeButtonArea}>
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