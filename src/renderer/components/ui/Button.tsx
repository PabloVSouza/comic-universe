import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import classNames from 'classnames'
import { Image } from 'components/ui'

const buttonStyling = {
  base: 'cursor-pointer relative overflow-hidden transition-all duration-500 ease-default',
  disabled: 'opacity-50 cursor-not-allowed',
  disabledToggle: 'bg-gray-400 dark:bg-gray-500 cursor-not-allowed !h-6 !w-11',
  loading: 'animate-spin',
  themes: {
    default: {
      button: { default: 'bg-oposite/70 px-5 py-1 rounded hover:bg-oposite', active: '' },
      icon: { default: 'bg-text-default w-full h-full opacity-80', active: '' }
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
    },
    toggle: {
      button: {
        default: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none bg-gray-200 dark:bg-gray-700`,
        active: '!bg-green-100 dark:!bg-green-900'
      },
      icon: {
        default: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1`,
        active: 'translate-x-6',
        disabled: 'bg-gray-400 dark:bg-gray-500 !h-4 !w-4'
      }
    },
    navigation: {
      button: {
        default:
          'bg-blue-500/70 hover:bg-blue-500/90 text-white px-4 py-2 rounded-lg transition-colors duration-200',
        active: 'bg-blue-500/90'
      },
      icon: {
        default: '',
        active: ''
      }
    },
    secondary: {
      button: {
        default:
          'px-4 py-2 rounded-lg text-white transition-colors duration-200 cursor-pointer bg-gray-500/70 hover:bg-gray-500/90',
        active: ''
      },
      icon: {
        default: '',
        active: ''
      }
    },
    primary: {
      button: {
        default:
          'px-4 py-2 rounded-lg text-white transition-colors duration-200 cursor-pointer bg-blue-500/70 hover:bg-blue-500/90',
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
    lg: 'w-16 h-16',
    xl: 'w-48 p-5',
    icon: 'w-8 h-8'
  },
  colors: {
    white: '!bg-zinc-100/80 hover:bg-zinc-50 text-zinc-950',
    black: '!bg-zing-950 hover:bg-zinc-800 text-zinc-50',
    green: 'bg-lime-500/70 hover:bg-lime-500 text-zinc-950',
    red: '!bg-red-500 hover:bg-lime-400 text-zinc-50'
  }
} as const

type ButtonProps = {
  active?: boolean
  className?: string
  children?: React.ReactNode
  color?: keyof typeof buttonStyling.colors
  disabled?: boolean
  icon?: string
  loading?: boolean
  loadingAnimation?: 'spin' | 'spin-reverse'
  onClick?: () => void
  size?: keyof typeof buttonStyling.sizes
  theme?: keyof typeof buttonStyling.themes
  to?: string
} & React.ComponentProps<'button'>

const Button: FC<ButtonProps> = ({
  active,
  className,
  children,
  color,
  disabled,
  icon,
  loading,
  loadingAnimation = 'spin',
  onClick,
  size,
  theme = 'default',
  to,
  ...props
}) => {
  const navigate = useNavigate()

  const handleClick = (): void => {
    if (onClick) onClick()
    if (to) navigate(to)
  }

  // Ensure theme exists, fallback to 'default' if not
  const safeTheme = buttonStyling.themes[theme] ? theme : 'default'

  const classProps = {
    className: classNames(
      buttonStyling.base,
      buttonStyling.themes[safeTheme].button.default,
      color ? buttonStyling.colors[color] : '',
      size ? buttonStyling.sizes[size] : '',
      disabled
        ? safeTheme === 'toggle'
          ? buttonStyling.disabledToggle
          : buttonStyling.disabled
        : '',
      className,
      active ? buttonStyling.themes[safeTheme].button.active : ''
    )
  }

  const customProps = {
    onClick: disabled ? undefined : () => handleClick(),
    disabled,
    ...classProps,
    ...props
  }

  return (
    <button {...customProps}>
      {icon ? (
        <Image
          className={classNames(
            buttonStyling.themes[safeTheme].icon.default,
            active && buttonStyling.themes[safeTheme].icon.active,
            disabled && safeTheme === 'toggle' && buttonStyling.themes[safeTheme].icon.disabled,
            loading &&
              (loadingAnimation === 'spin-reverse' ? 'animate-spin-reverse' : buttonStyling.loading)
          )}
          src={icon}
          svg
        />
      ) : (
        // For themes that don't use icons (like burger, toggle), render the icon styling directly
        <div
          className={classNames(
            buttonStyling.themes[safeTheme].icon.default,
            active && buttonStyling.themes[safeTheme].icon.active,
            disabled && safeTheme === 'toggle' && buttonStyling.themes[safeTheme].icon.disabled,
            loading &&
              (loadingAnimation === 'spin-reverse' ? 'animate-spin-reverse' : buttonStyling.loading)
          )}
        />
      )}
      {children}
    </button>
  )
}

export default Button
