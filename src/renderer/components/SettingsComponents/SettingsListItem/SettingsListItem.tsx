import style from './SettingsListItem.module.scss'
import Image from 'components/Image'

const SettingsListItem = ({ option }: { option: ISettingsOption }) => {
  return (
    <li className={style.SettingsListItem} onClick={option.onClick}>
      <p className={style.label}>{option.label}</p>
      <Image src={option.icon} svg className={style.icon} />
    </li>
  )
}

export default SettingsListItem
