import SettingsListItem from '../SettingsListItem'
import style from './SettingsList.module.scss'

const SettingsList = ({ options }: { options: ISettingsOption[] }) => {
  return (
    <ul className={style.SettingsList}>
      {options.map((option) => (
        <SettingsListItem option={option} />
      ))}
    </ul>
  )
}

export default SettingsList
