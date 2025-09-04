import ReactSelect from 'react-select'
import classNames from 'classnames'
import { Props as StateManagerProps } from 'react-select'

interface ISelectProps extends StateManagerProps {
  className?: string
}

export default function Select({ className, ...props }: ISelectProps) {
  return (
    <ReactSelect
      unstyled
      isSearchable={false}
      className="[&>*]:cursor-pointer [&>*]:transition-fade"
      classNames={{
        container: () => classNames('outline-none mr-px h-full w-44 rounded', className),
        input: () => '',
        control: () =>
          'pr-2 pl-5 h-full w-full overflow-hidden rounded !cursor-pointer hover:bg-list-item-hover hover:text-text-oposite',
        menu: () => 'w-full flex pt-px bg-default rounded overflow-hidden',
        menuList: () => 'flex flex-col w-full gap-px',
        option: () =>
          'bg-default w-full h-10 !flex justify-center items-center !cursor-pointer hover:bg-list-item-hover hover:text-text-oposite'
      }}
      {...props}
    />
  )
}
