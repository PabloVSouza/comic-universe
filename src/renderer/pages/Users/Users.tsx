import { useEffect, useState } from 'react'
import openWindow from 'functions/openWindow'

import Button from 'components/Button/Button'
import UsersList from '../../components/UsersComponents/UserList/UsersList'

import useLang from 'lang'

import useUsersStore from 'store/useUsersStore'

import confirmIcon from 'assets/confirm.svg'
import cancelIcon from 'assets/cancel.svg'

import style from './Users.module.scss'

const Init = (): JSX.Element => {
  useEffect(() => {
    openWindow({ component: 'Users', props: {} })
  }, [])

  return <></>
}

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
          <h1 className={style.header}>{lang.Users.createButton}</h1>
          <input
            type="text"
            placeholder={lang.Users.namePlaceholder}
            onChange={(e): void => setUserName(e.target.value)}
          />
          <div className={style.buttons}>
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
          <h1 className={style.header}>{lang.Users.header}</h1>
          <UsersList list={users} newUserAction={() => setNewUser(true)} />
        </>
      )}
    </>
  )
}

const windowSettings = {
  windowProps: {
    className: style.Users,
    contentClassName: style.Content,
    titleBar: false,
    closeable: false,
    movable: false,
    minimizable: false,
    maximizable: true,
    resizable: false,
    title: 'Users'
  },
  initialStatus: {
    startPosition: 'center',
    width: 500,
    height: 250
  }
} as TWindow

export default { Users, Init, ...windowSettings }
