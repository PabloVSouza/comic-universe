import UsersListItem from 'components/UsersComponents/UserListItem'

const UsersList = ({
  list,
  newUserAction
}: {
  list: UserInterface[]
  newUserAction: () => void
}): JSX.Element => {
  return (
    <div className="overflow-auto grow flex w-full flex-nowrap shrink-0 gap-2 justify-center px-2 items-center">
      <UsersListItem newUser newUserAction={newUserAction} />
      {list.map((item) => (
        <UsersListItem key={item.id} data={item} />
      ))}
    </div>
  )
}
export default UsersList
