import { FC } from 'react'
import UsersListItem from 'components/UsersComponents/UserListItem'

const UsersList: FC<{
  list: IUser[]
  newUserAction: () => void
}> = ({ list, newUserAction }) => {
  return (
    <div className="overflow-auto grow w-full flex flex-nowrap gap-2 justify-center px-2 items-center">
      <UsersListItem newUser newUserAction={newUserAction} />
      {list.map((item) => (
        <UsersListItem key={item.id} data={item} />
      ))}
    </div>
  )
}
export default UsersList
