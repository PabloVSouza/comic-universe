import ListItem from './ListItem'

const List = ({ options, activeOption }: { options: ISettingsOption[]; activeOption: string }) => {
  return (
    <ul className="w-14 h-full overflow-auto shrink-0 flex flex-col gap-px bg-modal shadow-basic">
      {options.map((option) => (
        <ListItem option={option} key={option.label} active={option.tag === activeOption} />
      ))}
    </ul>
  )
}

export default List
