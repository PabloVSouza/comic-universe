import { useEffect, useState } from 'react'
import Button from 'components/Button/Button'
import UsersList from 'components/UsersComponents/UserList/UsersList'
import useLang from 'lang'
import useUsersStore from 'store/useUsersStore'

import confirmIcon from 'assets/confirm.svg'
import cancelIcon from 'assets/cancel.svg'

const Users = (): JSX.Element => {
  const { updateUser } = useUsersStore()

  const [newUser, setNewUser] = useState(false)

  const [username, setUserName] = useState('')

  const lang = useLang()
  const { users, getUsers } = useUsersStore()

  const createUser = async (): Promise<void> => {
    await updateUser({ name: username })
    setNewUser(false)
  }

  useEffect(() => {
    getUsers()
  }, [])

  return (
    <>
      {newUser ? (
        <>
          <h1 className="text-2xl ">{lang.Users.createButton}</h1>
          <input
            className="w-11/12 p-2 border-none bg-default text-3xl rounded-lg"
            type="text"
            placeholder={lang.Users.namePlaceholder}
            onChange={(e): void => setUserName(e.target.value)}
          />
          <div className="">
            <Button
              icon={cancelIcon}
              theme="pure"
              size="xs"
              title={lang.Users.cancelButton}
              onClick={() => setNewUser(false)}
            />
            <Button
              icon={confirmIcon}
              theme="pure"
              size="xs"
              title={lang.Users.createButton}
              onClick={createUser}
            />
          </div>
        </>
      ) : (
        <>
          <h1 className="text-2xl">{lang.Users.header}</h1>
          <UsersList list={users} newUserAction={() => setNewUser(true)} />
        </>
      )}
    </>
  )
}

const windowSettings = {
  windowProps: {
    className: 'grow relative',
    contentClassName: 'flex w-full h-full flex-col justify-evenly items-center overflow-auto pt-5',
    maximizable: true,
    unique: true,
    title: 'Users'
  },
  initialStatus: {
    startPosition: 'center',
    width: 500,
    height: 250
  }
} as TWindow

export default { Users, ...windowSettings }
