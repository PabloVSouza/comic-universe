import Select from 'react-select'
import classNames from 'classnames'
import style from './style.module.scss'

interface CustomSelect {
  className?: string
  id?: string
}

const CustomSelect = ({ className, id, ...props }: CustomSelect): JSX.Element => {
  return (
    <Select
      className={classNames(style.select, className)}
      id={id}
      instanceId={id}
      unstyled
      {...props}
    />
  )
}

export default CustomSelect
