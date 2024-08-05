import { create } from 'zustand'
import { useEffect, useRef } from 'react'
import classNames from 'classnames'
import style from './ContextMenu.module.scss'
import Image from 'components/Image/Image'

export type TContextOptions = {
  title: string
  icon: string
  action: () => void
}

type TContextMenu = {
  options: TContextOptions[]
}

type TContextMenuPosition = {
  x: number
  y: number
}

interface useContextStore {
  visible: boolean
  position: TContextMenuPosition
  setPosition: (position: TContextMenuPosition) => void
  setVisible: (visible: boolean) => void
}

const useContextStore = create<useContextStore>((set) => ({
  visible: false,
  position: { x: 0, y: 0 },
  setPosition: (position) => set((state) => ({ ...state, position })),
  setVisible: (visible) => set((state) => ({ ...state, visible }))
}))

export const openContextMenu = (position: TContextMenuPosition) => {
  const { setVisible, setPosition } = useContextStore.getState()
  setPosition(position)
  setVisible(true)
}

export const ContextMenu = ({ options }: TContextMenu) => {
  const { visible, setVisible, position } = useContextStore()
  const dynamicStyle = {
    top: position.y,
    left: position.x
  }

  const ref = useRef<HTMLUListElement>(null)

  const handleMouse = (e: MouseEvent) => {
    //@ts-ignore Fix later
    if (e.target?.parentElement.parentElement !== ref.current) {
      setVisible(false)
    }
  }

  const handleAction = (option: TContextOptions) => {
    option.action()
    setVisible(false)
  }

  useEffect(() => {
    if (visible) {
      document.addEventListener('mousedown', handleMouse)
    }
    return () => {
      document.removeEventListener('mousedown', handleMouse)
    }
  }, [visible])

  return (
    <ul
      className={classNames(style.ContextMenu, visible ? style.visible : null)}
      style={dynamicStyle}
      ref={ref}
    >
      {options.map((option) => (
        <li key={option.title} onClick={() => handleAction(option)}>
          <p>{option.title}</p>
          {!!option.icon && <Image className={style.icon} src={option.icon} svg />}
        </li>
      ))}
    </ul>
  )
}
