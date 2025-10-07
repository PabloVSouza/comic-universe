import { FC } from 'react'
import ListItem from './ListItem'

const List: FC<{
  list: IUser[]
  newUserAction: () => void
}> = ({ list, newUserAction }) => {
  return (
    <div className="overflow-auto grow w-full flex flex-nowrap gap-2 justify-center px-2 items-center">
      <ListItem newUser newUserAction={newUserAction} />
      {list.map((item) => (
        <ListItem key={item.id} data={item} />
      ))}
    </div>
  )
}
export default List
