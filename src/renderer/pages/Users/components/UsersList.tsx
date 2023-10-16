import UsersListItem from './Item'

import style from './style.module.scss'

const UsersList = ({ list }: { list: User[] }): JSX.Element => {
  return (
    <div className={style.UsersList}>
      <UsersListItem newUser />
      {list.map((item) => (
        <UsersListItem key={item.id} data={item} />
      ))}
    </div>
  )
}
export default UsersList
