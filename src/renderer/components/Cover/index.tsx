import { ReactNode } from 'react'
import classNames from 'classnames'
import style from './style.module.scss'

interface Cover {
  className: string
  children: ReactNode
  visible: boolean
  index: number
}

const Cover = ({ className, children, visible, index, ...props }: Cover): JSX.Element => {
  return (
    <div
      className={classNames(style.cover, className, visible ? style.visible : null)}
      style={index ? { zIndex: index } : {}}
      {...props}
    >
      {children}
    </div>
  )
}

export default Cover
