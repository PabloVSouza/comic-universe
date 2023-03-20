import Select, { useStateManager } from 'react-select'
import classNames from 'classnames'
import style from './style.module.scss'

type stateManager = typeof useStateManager

interface CustomSelect extends stateManager {
  className: string
}

const CustomSelect = ({ className, ...props }: CustomSelect): JSX.Element => {
  return <Select className={classNames(style.select, { className })} unstyled {...props} />
}

export default CustomSelect
