import { useEffect, useRef, MutableRefObject } from 'react'
import classNames from 'classnames'
import Image from 'components/Image'

export type TSlideUpMenuOption = {
  title: string
  icon?: string
  isActive?: boolean
  action: () => void
}

interface ISlideUpMenuProps {
  options: TSlideUpMenuOption[]
  isOpen: boolean
  onClose: () => void
  children?: React.ReactNode
}

const SlideUpMenu = ({ options, isOpen, onClose, children }: ISlideUpMenuProps): React.JSX.Element => {
  const ref = useRef(null) as MutableRefObject<null> | MutableRefObject<HTMLDivElement>

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (target !== ref.current && !ref.current?.contains(target)) {
      onClose()
    }
  }

  const handleAction = (option: TSlideUpMenuOption) => {
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
          'fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-50',
          'transition-move-fade duration-300 ease-default',
          isOpen ? 'translate-y-0' : 'translate-y-full'
        )}
        ref={ref}
      >
        {children && (
          <div className="px-4 py-3 border-b border-border">
            {children}
          </div>
        )}
        
        <div className="p-4">
          <div className="space-y-2">
            {options.map((option, index) => (
              <button
                key={index}
                className={classNames(
                  'w-full flex items-center justify-between p-3 rounded-lg transition-colors',
                  'hover:bg-list-item-hover hover:text-text-oposite',
                  option.isActive 
                    ? 'bg-list-item-active text-text-oposite' 
                    : 'bg-list-item text-text-default'
                )}
                onClick={() => handleAction(option)}
              >
                <span className="text-left font-medium">{option.title}</span>
                <div className="flex items-center gap-2">
                  {option.isActive && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                  {option.icon && (
                    <Image
                      className="w-5 h-5 bg-text-default"
                      src={option.icon}
                      svg
                    />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default SlideUpMenu
