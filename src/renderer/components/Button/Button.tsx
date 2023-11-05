import { ReactElement, ButtonHTMLAttributes, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import Image from 'components/Image/Image'
import classNames from 'classnames'

import style from './style.module.scss'

type TButton = {
  active: boolean
  className: string
  children: ReactNode
  color: string
  icon: string
  onClick: () => void
  size: string
  theme: string
  to: string
} & ButtonHTMLAttributes<HTMLButtonElement>

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
}: Partial<TButton>): ReactElement => {
  const navigate = useNavigate()
  const handleClick = (): void => {
    if (onClick) onClick()
    if (to) navigate(to)
  }

  const classProps = {
    className: classNames(
      style.Button,
      color ? style[color] : null,
      theme ? style[theme] : null,
      size ? style[`size-${size}`] : null,
      className,
      active ? style.active : null
    )
  }

  const customProps = {
    onClick: () => handleClick(),
    ...classProps,
    ...props
  }

  return (
    <button {...customProps}>
      <Image className={style.icon} src={icon} svg />
      {children}
    </button>
  )
}

export default Button
