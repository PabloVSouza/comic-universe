import classNames from 'classnames'
import style from './SettingsListItem.module.scss'
import Image from 'components/Image'

const SettingsListItem = ({ option, active }: { option: ISettingsOption; active?: boolean }) => {
  return (
    <li
      className={classNames(style.SettingsListItem, active ? style.active : '')}
      onClick={option.onClick}
      title={option.label}
    >
      <div className={style.IconContainer}>
        <Image src={option.icon} svg className={style.Icon} />
      </div>
    </li>
  )
}

export default SettingsListItem
