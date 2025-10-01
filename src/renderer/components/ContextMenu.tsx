import { create } from 'zustand'
import { MutableRefObject, useEffect, useRef } from 'react'
import classNames from 'classnames'
import Image from 'components/Image'

export type ContextOption = {
  title: string
  icon: string
  action: () => void
}

type ContextMenuProps = {
  options: ContextOption[]
}

type ContextMenuPosition = {
  x: number
  y: number
}

interface useContextStore {
  visible: boolean
  position: ContextMenuPosition
  setPosition: (position: ContextMenuPosition) => void
  setVisible: (visible: boolean) => void
}

const useContextStore = create<useContextStore>((set) => ({
  visible: false,
  position: { x: 0, y: 0 },
  setPosition: (position) => set((state) => ({ ...state, position })),
  setVisible: (visible) => set((state) => ({ ...state, visible }))
}))

export const openContextMenu = (position: ContextMenuPosition) => {
  const { setVisible, setPosition } = useContextStore.getState()
  setPosition(position)
  setVisible(true)
}

export const ContextMenu = ({ options }: ContextMenuProps) => {
  const { visible, setVisible, position } = useContextStore()
  const dynamicStyle = {
    top: position.y,
    left: position.x
  }

  const ref = useRef(null) as MutableRefObject<null> | MutableRefObject<HTMLUListElement>

  const handleMouse = (e: MouseEvent) => {
    const target = e.target as HTMLUListElement

    if (target !== ref.current && !ref.current?.contains(target)) {
      setVisible(false)
    }
  }

  const handleAction = (option: ContextOption) => {
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
      className={classNames(
        'fixed z-50 bg-default text-text-default rounded shadow-basic transition-fade',
        visible ? 'opacity-100 visible' : 'opacity-0 invisible'
      )}
      style={dynamicStyle}
      ref={ref}
    >
      {options.map((option) => (
        <li
          className="group rounded p-4 cursor-pointer border-b-text-oposite flex items-center h-12 gap-4 last:border-b-transparent hover:bg-oposite hover:text-text-oposite"
          key={option.title}
          onClick={() => handleAction(option)}
        >
          <p className="grow">{option.title}</p>
          {!!option.icon && (
            <Image
              className={'max-h-full w-5 aspect-square bg-text-default group-hover:bg-text-oposite'}
              src={option.icon}
              svg
            />
          )}
        </li>
      ))}
    </ul>
  )
}
