import { useState, useRef } from 'react'
import classNames from 'classnames'
import Image from 'components/Image'

export interface IMousePos {
  x: number
  y: number
}

interface IZoomWindowProps {
  mousePos: IMousePos
  image: string
  visible: boolean
}

interface IWindowPosition {
  top: number
  left: number
}

interface IZoomPosition {
  top: number
  left: number
  width: string
  height: string
}

const ZoomWindow = ({ mousePos, image, visible }: IZoomWindowProps): JSX.Element => {
  const windowRef = useRef(null)

  const [zoomFactor, setZoomFactor] = useState(2)

  const windowPosition = (): IWindowPosition => {
    if (!!windowRef.current && mousePos.y) {
      const { offsetHeight, offsetWidth } = windowRef.current

      return {
        top: mousePos.y - offsetHeight / 2,
        left: mousePos.x - offsetWidth / 2
      }
    }
    return {} as IWindowPosition
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

  const zoomPosition = (): IZoomPosition => {
    if (!!windowRef.current && mousePos.y) {
      const { offsetHeight, offsetWidth } = windowRef.current

      return {
        top: mousePos.y * zoomFactor * -1 + offsetHeight / 2,
        left: mousePos.x * zoomFactor * -1 + offsetWidth / 2,
        width: `${zoomFactor}00vw`,
        height: `${zoomFactor}00vh`
      }
    }
    return {} as IZoomPosition
  }

  return (
    <div
      className={classNames(
        'w-96 aspect-square absolute overflow-hidden z-20 cursor-zoom-in shadow-2xl shadow-black rounded-full transition-fade duration-500 ease-default',
        visible ? ' opacity-100' : ' opacity-0 invisible'
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

export default ZoomWindow
