import { forwardRef } from 'react'
import classNames from 'classnames'

interface DisplayValueProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children: React.ReactNode
  href?: string
  target?: string
  rel?: string
  truncate?: boolean
}

const DisplayValue = forwardRef<HTMLDivElement, DisplayValueProps>(
  ({ className, children, href, target, rel, truncate, ...props }, ref) => {
    const baseClasses =
      'px-3 py-2 bg-list-item text-text-default rounded-lg transition-colors duration-200'
    const linkClasses = href ? 'hover:bg-list-item-hover cursor-pointer' : ''
    const truncateClasses = truncate ? 'truncate' : ''

    if (href) {
      return (
        <a
          href={href}
          target={target}
          rel={rel}
          className={classNames(baseClasses, linkClasses, truncateClasses, className)}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
      )
    }

    return (
      <div ref={ref} className={classNames(baseClasses, truncateClasses, className)} {...props}>
        {children}
      </div>
    )
  }
)

DisplayValue.displayName = 'DisplayValue'

export default DisplayValue
