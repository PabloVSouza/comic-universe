import { useNavigate } from 'react-router-dom'
import classNames from 'classnames'

import Image from 'components/Image'

import usePersist from 'store/persist'

import style from './style.module.scss'

import plusIcon from 'assets/plus.svg'
import userIcon from 'assets/user.svg'

const UsersListItem = ({ data, newUser }) => {
  const navigate = useNavigate()
  const { setCurrentUser } = usePersist()

  const setUser = () => {
    setCurrentUser(data)
    navigate('/')
  }

  if (newUser)
    return (
      <div className={classNames(style.UsersListItem, style.newUser)}>
        <Image className={style.background} svg src={plusIcon} />
      </div>
    )

  return (
    <div className={style.UsersListItem} onClick={() => setUser()}>
      <Image className={style.background} svg src={userIcon} />
      <p className={style.name}>{data.name}</p>
    </div>
  )
}
export default UsersListItem
