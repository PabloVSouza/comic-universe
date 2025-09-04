import { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import classNames from 'classnames'
import Image from 'components/Image'

const buttonStyling = {
  base: 'cursor-pointer relative overflow-hidden transition-all duration-500 ease-default',
  themes: {
    default: {
      button: { default: 'bg-oposite/70 px-5 py-1 rounded hover:bg-oposite', active: '' },
      icon: { default: '', active: '' }
    },
    pure: {
      button: {
        default:
          'group border-none bg-transparent aspect-square p-1 rounded hover:bg-list-item-active',
        active: ''
      },
      icon: {
        default:
          'bg-text-default w-full h-full aspect-square opacity-80 group-hover:bg-text-oposite',
        active: ''
      }
    },
    burger: {
      button: {
        default:
          'group h-full aspect-square border-none bg-transparent flex justify-center items-center p-2.5 rounded hover:bg-list-item-active',
        active: ''
      },
      icon: {
        default: `
          w-full h-1 bg-text-default relative group-hover:bg-text-oposite rounded transition-transform duration-500 ease-default
          before:content-[''] before:absolute before:w-full before:h-1 before:bg-text-default before:rounded before:left-0 before:right-0 before:mx-auto before:-translate-y-[12px] group-hover:before:bg-text-oposite before:transition-transform before:duration-500 before:ease-default
          after:content-[''] after:absolute after:w-full after:h-1 after:bg-text-default after:rounded after:left-0 after:right-0 after:mx-auto after:translate-y-[12px] group-hover:after:bg-text-oposite before:transition-transform before:duration-500 before:ease-default
        `,
        active: `
          -translate-x-full -translate-y-1 !bg-transparent
          before:translate-y-full before:translate-x-full before:rotate-45
          after:translate-y-full after:translate-x-full after:-rotate-45
        `
      }
    },
    resize: {
      button: {
        default: `w-8 relative aspect-square after:content-['>'] after:block after:scale-150 after:rotate-45 hover:bg-list-item-active hover:text-text-oposite`,
        active: ''
      },
      icon: {
        default: '',
        active: ''
      }
    },
    close: {
      button: {
        default: `border border-none w-10 h-full after:content-['x'] text-text-default bg-red-500/70 hover:bg-red-500/90`,
        active: ''
      },
      icon: {
        default: '',
        active: ''
      }
    },
    minimize: {
      button: {
        default: `border border-none w-10 h-full after:content-['----'] after:tracking-[-1px] bg-yellow-400/80 hover:bg-yellow-400/90`,
        active: ''
      },
      icon: {
        default: '',
        active: ''
      }
    }
  },
  sizes: {
    xxs: 'w-9',
    xs: 'w-12',
    s: 'w-20',
    m: 'w-24',
    l: 'w-44',
    xl: 'w-48 p-5'
  },
  colors: {
    white: '!bg-zinc-100/80 hover:bg-zinc-50 text-zinc-950',
    black: '!bg-zing-950 hover:bg-zinc-800 text-zinc-50',
    green: 'bg-lime-500/70 hover:bg-lime-500 text-zinc-950',
    red: '!bg-red-500 hover:bg-lime-400 text-zinc-50'
  }
} as const

type TButton = {
  active?: boolean
  className?: string
  children?: React.ReactNode
  color?: keyof typeof buttonStyling.colors
  icon?: string
  onClick?: () => void
  size?: keyof typeof buttonStyling.sizes
  theme?: keyof typeof buttonStyling.themes
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
  theme = 'default',
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
      buttonStyling.base,
      buttonStyling.themes[theme].button.default,
      color ? buttonStyling.colors[color] : '',
      size ? buttonStyling.sizes[size] : '',
      className,
      active ? buttonStyling.themes[theme].button.active : ''
    )
  }

  const customProps = {
    onClick: () => handleClick(),
    ...classProps,
    ...props
  }

  return (
    <button {...customProps}>
      {icon ? (
        <Image
          className={classNames(
            buttonStyling.themes[theme].icon.default,
            active && buttonStyling.themes[theme].icon.active
          )}
          src={icon}
          svg
        />
      ) : (
        <div
          className={classNames(
            buttonStyling.themes[theme].icon.default,
            active && buttonStyling.themes[theme].icon.active
          )}
        />
      )}
      {children}
    </button>
  )
}

export default Button
