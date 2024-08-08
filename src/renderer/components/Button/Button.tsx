import { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import Image from 'components/Image'
import classNames from 'classnames'
import style from './Button.module.scss'

type TButton = {
  active?: boolean
  className?: string
  children?: React.ReactNode
  color?: 'white' | 'black' | 'green' | 'red' | 'blue' | 'yellow'
  icon?: string
  onClick?: () => void
  size?: 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl'
  theme?: 'pure' | 'burger' | 'resize' | 'close' | 'minimize'
  to?: string
} & React.ComponentProps<'button'>

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
}: TButton): ReactElement => {
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
      {icon ? <Image className={style.icon} src={icon} svg /> : <div className={style.icon} />}
      {children}
    </button>
  )
}

export default Button
