import { ReactNode } from 'react'
import classNames from 'classnames'

interface Cover {
  className?: string
  children?: ReactNode
  visible?: boolean
  index?: string
}

const Cover = ({ className, children, visible, index, ...props }: Cover): JSX.Element => {
  return (
    <div
      className={classNames(
        'w-full h-full absolute flex items-center justify-center bg-default backdrop-blur-sm transition-all duration-500 ease-default z-30',
        visible ? 'visible opacity-100' : 'invisible opacity-0',
        className
      )}
      style={index ? { zIndex: index } : {}}
      {...props}
    >
      {children}
    </div>
  )
}

export default Cover
