import { forwardRef } from 'react'
import ReactSelect, { Props as StateManagerProps } from 'react-select'
import classNames from 'classnames'

interface SelectProps extends Omit<StateManagerProps, 'theme'> {
  className?: string
  theme?: 'styled' | 'native'
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, theme = 'styled', ...props }, ref) => {
    if (theme === 'native') {
      // For native theme, we need to convert react-select props to native select props
      const { options, value, onChange, placeholder, ...nativeProps } = props as any

      return (
        <select
          ref={ref}
          value={value?.value || ''}
          onChange={(e) => {
            const selectedOption = options?.find((opt: any) => opt.value === e.target.value)
            onChange?.(selectedOption, { action: 'select-option' })
          }}
          className={classNames(
            'px-3 py-2 bg-list-item text-text-default rounded-lg focus:outline-none transition-colors duration-200',
            'hover:bg-list-item-hover',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          {...nativeProps}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options?.map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )
    }

    return (
      <ReactSelect
        unstyled
        isSearchable={false}
        className="[&>*]:cursor-pointer [&>*]:transition-fade"
        menuPortalTarget={document.body}
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 })
        }}
        classNames={{
          container: () => classNames('outline-none mr-px h-full w-44 rounded relative', className),
          input: () => '',
          control: () =>
            'pr-2 pl-5 h-full w-full overflow-hidden rounded !cursor-pointer hover:bg-list-item-hover hover:text-text-oposite',
          menu: () => 'w-full flex pt-px bg-list-item rounded overflow-hidden',
          menuList: () => 'flex flex-col w-full gap-px',
          option: () =>
            'bg-list-item text-text-default w-full h-10 !flex justify-center items-center !cursor-pointer hover:bg-list-item-hover hover:text-text-oposite'
        }}
        {...props}
      />
    )
  }
)

Select.displayName = 'Select'

export default Select
