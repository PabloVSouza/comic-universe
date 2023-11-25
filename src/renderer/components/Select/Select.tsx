import ReactSelect from 'react-select'
import classNames from 'classnames'
import style from './Select.module.scss'
import { StateManagerProps } from 'react-select/dist/declarations/src/useStateManager'

type TSelect = {
  className?: string
} & StateManagerProps

export default function Select({ className, ...props }: TSelect) {
  return (
    <ReactSelect
      unstyled
      isSearchable={false}
      classNames={{
        container: () => classNames(style.Select, className),
        input: () => style.Input,
        control: () => style.Control,
        menu: () => style.Menu,
        menuList: () => style.MenuList,
        option: () => style.Option
      }}
      {...props}
    />
  )
}
