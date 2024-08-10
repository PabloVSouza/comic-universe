import classNames from 'classnames'
import style from './SettingsListItem.module.scss'
import Image from 'components/Image'

const SettingsListItem = ({ option, active }: { option: ISettingsOption; active?: boolean }) => {
  return (
    <li
      className={classNames(style.SettingsListItem, active ? style.active : '')}
      onClick={option.onClick}
    >
      <p className={style.Label}>{option.label}</p>
      <div className={style.IconContainer}>
        <Image src={option.icon} svg className={style.Icon} />
      </div>
    </li>
  )
}

export default SettingsListItem
