import { ReactNode } from 'react'
import classNames from 'classnames'

import style from './style.module.scss'

interface Container {
  className?: string
  children?: ReactNode
}

const Container = ({ className, children }: Container): JSX.Element => {
  return <div className={classNames(style.container, className)}>{children}</div>
}

export default Container
