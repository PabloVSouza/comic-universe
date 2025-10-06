import classNames from 'classnames'
import { Image } from 'components/UiComponents'

const SettingsListItem = ({ option, active }: { option: ISettingsOption; active?: boolean }) => {
  return (
    <li
      className={classNames(
        'w-full flex items-center justify-center cursor-pointer shrink-0 gap-px hover:bg-list-item-hover aspect-square transition-colors duration-500 ease-default',
        active ? '!bg-list-item-active' : 'bg-list-item'
      )}
      onClick={option.onClick}
      title={option.label}
    >
      <div className="h-full aspect-square p-4 shrink-0">
        <Image
          src={option.icon}
          svg
          className={classNames('h-full', active ? 'bg-text-oposite' : 'bg-text-default')}
        />
      </div>
    </li>
  )
}

export default SettingsListItem
