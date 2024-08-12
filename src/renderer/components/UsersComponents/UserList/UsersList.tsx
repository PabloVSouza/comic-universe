import UsersListItem from '../UserListItem/UserListItem'

import style from './UsersList.module.scss'

const UsersList = ({
  list,
  newUserAction
}: {
  list: UserInterface[]
  newUserAction: () => void
}): JSX.Element => {
  return (
    <div className={style.UsersList}>
      <UsersListItem newUser newUserAction={newUserAction} />
      {list.map((item) => (
        <UsersListItem key={item.id} data={item} />
      ))}
    </div>
  )
}
export default UsersList
