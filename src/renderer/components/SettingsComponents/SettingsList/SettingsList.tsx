import SettingsListItem from '../SettingsListItem'
import style from './SettingsList.module.scss'

const SettingsList = ({
  options,
  activeOption
}: {
  options: ISettingsOption[]
  activeOption: string
}) => {
  return (
    <ul className={style.SettingsList}>
      {options.map((option) => (
        <SettingsListItem option={option} key={option.label} active={option.tag === activeOption} />
      ))}
    </ul>
  )
}

export default SettingsList
