import { FC, ReactNode } from 'react'
import classNames from 'classnames'

interface CoverProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: ReactNode
  visible?: boolean
  index?: string
}

const Cover: FC<CoverProps> = ({ className, children, visible, index, ...props }) => {
  return (
    <div
      className={classNames(
        'w-full h-full absolute flex items-center justify-center bg-black/30 backdrop-blur-sm transition-all duration-500 ease-default z-30',
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
