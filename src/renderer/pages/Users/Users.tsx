import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import Window from 'components/Window/Window'
import Button from 'components/Button/Button'
import UsersList from '../../components/UsersComponents/UserList/UsersList'

import useLang from 'lang'

import useUsersStore from 'store/useUsersStore'

import confirmIcon from 'assets/confirm.svg'
import cancelIcon from 'assets/cancel.svg'

import style from './style.module.scss'

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
    <Window className={style.Users} contentClassName={style.Content}>
      {newUser ? (
        <>
          <h1 className={style.header}>{lang.Users.createButton}</h1>
          <div className={style.body}>
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
          </div>
        </>
      ) : (
        <>
          <h1 className={style.header}>{lang.Users.header}</h1>
          <div className={style.body}>
            <UsersList list={users} />
          </div>
        </>
      )}
    </Window>
  )
}

export default Users
