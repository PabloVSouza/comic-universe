import { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
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

  const iconStyleProps = { style: icon ? { WebkitMaskImage: `url(${icon})` } : undefined }

  const customProps = {
    onClick: () => handleClick(),
    ...classProps,
    ...props
  }

  return (
    <button {...customProps}>
      <div className={style.icon} {...iconStyleProps} />
      {children}
    </button>
  )
}

export default Button
