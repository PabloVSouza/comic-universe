import Window from 'components/Window'
import UsersList from './components/UsersList'

import useLang from 'lang'

import style from './style.module.scss'

const Users = (): JSX.Element => {
  const lang = useLang()
  const list = [] as UserInterface[]

  return (
    <Window className={style.Users} contentClassName={style.Content}>
      <h1>{lang.Users.header}</h1>
      <UsersList list={list} />
    </Window>
  )
}

export default Users
