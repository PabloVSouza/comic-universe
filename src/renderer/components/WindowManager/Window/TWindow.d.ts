type TWindow = {
  id: string
  component: () => React.ReactElement
  componentProps: { [key: string]: unknown }
  windowProps: TWindowProps
  windowStatus: TWindowStatus
  initialStatus: TInitialStatus
}

type TWindowStatus = {
  isMoving?: boolean
  isResizing?: boolean
  isMaximized?: boolean
  isMinimized?: boolean
  isFocused?: boolean
  width: number
  height: number
  left: number
  top: number
}

type TInitialStatus = {
  isMaximized?: boolean
  isMinimized?: boolean
  isFocused?: boolean
  width: number | string
  height: number | string
  left: number | string
  top: number | string
  startPosition?:
    | 'topLeft'
    | 'topCenter'
    | 'topRight'
    | 'centerLeft'
    | 'center'
    | 'centerRight'
    | 'bottomLeft'
    | 'bottomCenter'
    | 'bottomRight'
}

type TWindowProps = {
  id: string
  containerSize: { width: number; height: number }
  children?: React.ReactNode
  closeable?: boolean
  className?: string
  maximizable?: boolean
  minimizable?: boolean
  resizable?: boolean
  movable?: boolean
  title?: string
  titleBar?: boolean
  initialStatus?: TWindowStatus
} & React.ComponentProps<'div'>
