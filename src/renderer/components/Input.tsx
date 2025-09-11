import { forwardRef } from 'react'
import classNames from 'classnames'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={classNames(
          'px-3 py-2 bg-list-item text-text-default rounded-lg focus:outline-none transition-colors duration-200',
          'hover:bg-list-item-hover',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export default Input
