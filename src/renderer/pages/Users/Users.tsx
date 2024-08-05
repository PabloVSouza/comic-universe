import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import openWindow from 'functions/openWindow'

import Button from 'components/Button/Button'
import UsersList from '../../components/UsersComponents/UserList/UsersList'

import useLang from 'lang'

import useUsersStore from 'store/useUsersStore'

import confirmIcon from 'assets/confirm.svg'
import cancelIcon from 'assets/cancel.svg'

import style from './Users.module.scss'

const Init = (): void => {
  useEffect(() => {
    openWindow({ component: 'Users', props: {} })
  }, [])
}

const Users = (): JSX.Element => {
  const params = useParams()
  const navigate = useNavigate()
  const newUser = !!params.newUser

  const { updateUser } = useUsersStore()

  const [username, setUserName] = useState('')

  const lang = useLang()
  const { users, getUsers } = useUsersStore()

  const createUser = async (): Promise<void> => {
    await updateUser({ name: username })
    navigate('/users')
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
              to="/users"
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
          <UsersList list={users} />
        </>
      )}
    </>
  )
}

const windowSettings = {
  windowProps: {
    className: style.Users,
    contentClass: style.Content,
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
