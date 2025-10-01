import { FC, useEffect, useRef, MutableRefObject } from 'react'
import classNames from 'classnames'

export type SlideUpMenuOption = {
  title: string
  icon?: string
  isActive?: boolean
  action: () => void
}

interface SlideUpMenuProps {
  options: SlideUpMenuOption[]
  isOpen: boolean
  onClose: () => void
  children?: React.ReactNode
}

const SlideUpMenu: FC<SlideUpMenuProps> = ({ options, isOpen, onClose, children }) => {
  const ref = useRef(null) as MutableRefObject<null> | MutableRefObject<HTMLDivElement>

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (target !== ref.current && !ref.current?.contains(target)) {
      onClose()
    }
  }

  const handleAction = (option: SlideUpMenuOption) => {
    option.action()
    onClose()
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <>
      {/* Backdrop */}
      <div
        className={classNames(
          'fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-fade',
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        )}
        onClick={onClose}
      />

      {/* Menu */}
      <div
        className={classNames(
          'fixed bottom-20 right-4 bg-default backdrop-blur-sm border border-border rounded-lg shadow-basic z-50',
          'transition-move-fade duration-300 ease-default min-w-64',
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        )}
        ref={ref}
      >
        {children && <div className="px-4 py-3 border-b border-border">{children}</div>}

        <div className="p-4">
          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-text-default font-medium">{option.title}</span>
                <button
                  className={classNames(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    option.isActive ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  )}
                  onClick={() => handleAction(option)}
                >
                  <span
                    className={classNames(
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      option.isActive ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default SlideUpMenu
