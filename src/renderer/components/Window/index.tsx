import { ReactNode } from 'react'
import style from './style.module.scss'
import Button from 'components/Button'
import classNames from 'classnames'

interface Window {
  children?: ReactNode
  close?: boolean
  closebar?: boolean
  className?: string
  contentClassName?: string
  onClick?: () => void
  to?: string
}

const Window = ({
  children,
  close,
  closebar,
  className,
  contentClassName,
  onClick,
  to,
  ...props
}: Window): JSX.Element => {
  return (
    <div className={classNames(style.Window, className)} {...props}>
      {closebar && (
        <div className={style.topBar}>
          <Button theme="closeButton" onClick={onClick} to={to} />
        </div>
      )}

      {close && <Button theme="closeButton" onClick={onClick} to={to} />}

      <div className={classNames(style.content, contentClassName)}>{children}</div>
    </div>
  )
}

export default Window
