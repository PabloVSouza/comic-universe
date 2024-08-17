import { useState, useRef } from 'react'
import classNames from 'classnames'
import Image from 'components/Image/Image'

export interface MousePos {
  x: number
  y: number
}

interface ZoomWindow {
  mousePos: MousePos
  image: string
  visible: boolean
}

interface WindowPosition {
  top: number
  left: number
}

interface ZoomPosition {
  top: number
  left: number
  width: string
  height: string
}

const ReaderZoomWindow = ({ mousePos, image, visible }: ZoomWindow): JSX.Element => {
  const windowRef = useRef(null)

  const [zoomFactor, setZoomFactor] = useState(2)

  const windowPosition = (): WindowPosition => {
    if (!!windowRef.current && mousePos.y) {
      const { offsetHeight, offsetWidth } = windowRef.current

      return {
        top: mousePos.y - offsetHeight / 2,
        left: mousePos.x - offsetWidth / 2
      }
    }
    return {} as WindowPosition
  }

  const changeZoomFactor = (e): void => {
    const delta = e.deltaY

    if (delta > 0) {
      if (zoomFactor - 1 >= 2) {
        setZoomFactor(zoomFactor - 1)
      }
    } else {
      setZoomFactor(zoomFactor + 1)
    }
  }

  const zoomPosition = (): ZoomPosition => {
    if (!!windowRef.current && mousePos.y) {
      const { offsetHeight, offsetWidth } = windowRef.current

      return {
        top: mousePos.y * zoomFactor * -1 + offsetHeight / 2,
        left: mousePos.x * zoomFactor * -1 + offsetWidth / 2,
        width: `${zoomFactor}00vw`,
        height: `${zoomFactor}00vh`
      }
    }
    return {} as ZoomPosition
  }

  return (
    <div
      className={classNames(
        'w-1/3 aspect-square absolute overflow-hidden z-20 cursor-zoom-in shadow-default rounded-full transition-opacity duration-500 ease-default',
        visible ? ' opacity-100' : ' opacity-0'
      )}
      onWheel={changeZoomFactor}
      style={windowPosition()}
      ref={windowRef}
    >
      <Image
        src={image}
        className="absolute object-contain bg-no-repeat bg-center"
        style={zoomPosition()}
      />
    </div>
  )
}

export default ReaderZoomWindow
