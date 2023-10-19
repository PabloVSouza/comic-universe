import { useNavigate } from 'react-router-dom'
import classNames from 'classnames'

import Image from 'components/Image'

import usePersistStore from 'store/usePersistStore'

import style from './style.module.scss'

import plusIcon from 'assets/plus.svg'
import userIcon from 'assets/user.svg'

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

  if (newUser)
    return (
      <div className={classNames(style.UsersListItem, style.newUser)}>
        <Image className={style.background} svg src={plusIcon} />
      </div>
    )

  return (
    <div className={style.UsersListItem} onClick={(): void => setUser()}>
      <Image className={style.background} svg src={userIcon} />
      <p className={style.name}>{data?.name}</p>
    </div>
  )
}
export default UsersListItem
