import { CSSProperties, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import classNames from 'classnames'

import style from './style.module.scss'

interface Button {
  active: boolean
  className: string
  children: ReactNode
  color: string
  icon: string
  onClick: () => void
  size: string
  theme: string
  to: string
}

const Button = ({
  active,
  className,
  children,
  color,
  icon,
  onClick,
  size,
  theme,
  to,
  ...props
}: Partial<Button>): JSX.Element => {
  const navigate = useNavigate()

  const classes = classNames(
    style.Button,
    color ? style[color] : null,
    theme ? style[theme] : null,
    size ? style[`size-${size}`] : null,
    className,
    active ? style.active : null
  )
  const handleClick = (): void => {
    if (onClick) onClick()
    if (to) navigate(to)
  }

  const iconStyle = {
    WebkitMaskImage: !!icon && `url(${icon})`
  } as CSSProperties

  return (
    <button className={classes} onClick={(): void => handleClick()} {...props}>
      <div className={style.icon} style={iconStyle} />
      {children}
    </button>
  )
}

export default Button
