import { ReactNode } from 'react'
import classNames from 'classnames'
import style from './Cover.module.scss'

interface Cover {
  className?: string
  children?: ReactNode
  visible?: boolean
  index?: string
}

const Cover = ({ className, children, visible, index, ...props }: Cover): JSX.Element => {
  return (
    <div
      className={classNames(style.Cover, className, visible ? style.visible : null)}
      style={index ? { zIndex: index } : {}}
      {...props}
    >
      {children}
    </div>
  )
}

export default Cover
