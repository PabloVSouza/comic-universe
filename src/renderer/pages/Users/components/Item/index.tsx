import { useNavigate } from 'react-router-dom'
import classNames from 'classnames'

import Image from 'components/Image'

import usePersistStore from 'store/usePersistStore'

import style from './style.module.scss'

import plusIcon from 'assets/plus.svg'
import userIcon from 'assets/user.svg'
import deleteIcon from 'assets/trash.svg'

interface UsersListItem {
  data?: UserInterface
  newUser?: boolean
}

const UsersListItem = ({ data, newUser }: UsersListItem): JSX.Element => {
  const navigate = useNavigate()
  const { setCurrentUser } = usePersistStore()

  const setUser = (): void => {
    if (data) {
      setCurrentUser(data)
      navigate('/')
    }
  }

  const deleteUser = async (): Promise<void> => {
    return new Promise((resolve) => resolve())
  }

  if (newUser)
    return (
      <div
        className={classNames(style.UsersListItem, style.newUser)}
        onClick={(): void => navigate('/users/new')}
      >
        <Image className={style.background} svg src={plusIcon} />
      </div>
    )

  return (
    <div className={style.UsersListItem} onClick={(): void => setUser()}>
      <Image className={style.background} svg src={userIcon} />
      <p className={style.name}>{data?.name}</p>
      <div className={style.deleteButton} onClick={(): Promise<void> => deleteUser()}>
        <Image className={style.deleteImage} svg src={deleteIcon} />
      </div>
    </div>
  )
}
export default UsersListItem
