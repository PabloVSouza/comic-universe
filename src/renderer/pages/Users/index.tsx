import { useEffect } from 'react'

import Window from 'components/Window'
import UsersList from './components/UsersList'

import useLang from 'lang'

import useUsersStore from 'store/useUsersStore'

import style from './style.module.scss'

const Users = (): JSX.Element => {
  const lang = useLang()
  const { users, getUsers } = useUsersStore()

  useEffect(() => {
    getUsers()
  }, [])

  return (
    <Window className={style.Users} contentClassName={style.Content}>
      <h1>{lang.Users.header}</h1>
      <UsersList list={users} />
    </Window>
  )
}

export default Users
