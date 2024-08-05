import { useNavigate } from 'react-router-dom'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css

import classNames from 'classnames'

import Image from 'components/Image/Image'
import useLang from 'lang'

import usePersistStore from 'store/usePersistStore'

import style from './UserListItem.module.scss'

import plusIcon from 'assets/plus.svg'
import userIcon from 'assets/user.svg'
import deleteIcon from 'assets/trash.svg'
import useUsersStore from 'store/useUsersStore'
import useDashboardStore from 'store/useDashboardStore'
import useWindowManagerStore from 'store/useWindowManagerStore'

interface UsersListItem {
  data?: UserInterface
  newUser?: boolean
}

const UsersListItem = ({ data, newUser }: UsersListItem): JSX.Element => {
  const navigate = useNavigate()
  const lang = useLang()

  const { setCurrentUser } = usePersistStore()
  const { deleteUser } = useUsersStore()
  const { getListDB } = useDashboardStore()
  const { currentWindows, removeWindow } = useWindowManagerStore()

  const closeUserWindow = () => {
    for (const window of currentWindows) {
      removeWindow(window.id)
    }
  }

  const setUser = async (): Promise<void> => {
    if (data) {
      setCurrentUser(data)
      closeUserWindow()
      await getListDB()
      navigate('/')
    }
  }

  const id = data?.id ?? 0

  const handleDeleteUser = async (): Promise<void> => {
    if (id) {
      confirmAlert({
        title: lang.Users.deleteUser.deleteUserTitle,
        message: lang.Users.deleteUser.deleteUserMessage,
        buttons: [
          {
            label: lang.Users.deleteUser.confirmDeleteButton,
            onClick: async () => await deleteUser(id)
          },
          {
            label: lang.Users.deleteUser.cancelDeleteButton
          }
        ]
      })
    }
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
    <div className={style.UsersListItem}>
      <Image className={style.background} svg src={userIcon} />
      <div onClick={(): Promise<void> => setUser()} className={style.selectButton}>
        <p className={style.name}>{data?.name}</p>
      </div>
      <div className={style.deleteButton} onClick={(): Promise<void> => handleDeleteUser()}>
        <Image className={style.deleteImage} svg src={deleteIcon} />
      </div>
    </div>
  )
}
export default UsersListItem
