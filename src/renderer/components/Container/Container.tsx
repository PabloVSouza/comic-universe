import { ReactNode } from 'react'
import classNames from 'classnames'

import style from './Container.module.scss'

interface Container {
  className?: string
  children?: ReactNode
}

const Container = ({ className, children }: Container): JSX.Element => {
  return <div className={classNames(style.Container, className)}>{children}</div>
}

export default Container
