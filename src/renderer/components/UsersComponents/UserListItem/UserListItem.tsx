import { useNavigate } from 'react-router-dom'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css

import classNames from 'classnames'

import Image from 'components/Image/Image'
import useLang from 'lang'

import usePersistStore from 'store/usePersistStore'

import plusIcon from 'assets/plus.svg'
import userIcon from 'assets/user.svg'
import deleteIcon from 'assets/trash.svg'
import useUsersStore from 'store/useUsersStore'
import useDashboardStore from 'store/useDashboardStore'
import useWindowManagerStore from 'store/useWindowManagerStore'

interface UsersListItem {
  data?: UserInterface
  newUser?: boolean
  newUserAction?: () => void
}

const UsersListItem = ({ data, newUser, newUserAction }: UsersListItem): JSX.Element => {
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

  const baseStyling =
    'w-24 rounded-full aspect-square cursor-pointer shrink-1 flex justify-center items-center !overflow-clip relative border border-white bg-light/60 hover:bg-light/80 transition-all duration-500 ease-default box-border'

  const bgStyling = 'w-full h-full absolute top-0 z-10 bg-dark'

  if (newUser)
    return (
      <div className={classNames(baseStyling)} onClick={newUserAction}>
        <Image className={bgStyling} svg src={plusIcon} />
      </div>
    )

  return (
    <div className={baseStyling}>
      <Image className={bgStyling} svg src={userIcon} />
      <div onClick={(): Promise<void> => setUser()} className="w-full h-3/4 absolute top-0 z-10">
        <p className="w-full backdrop-blur-sm text-text-dark text-center py-1 absolute bottom-0 bg-light">
          {data?.name}
        </p>
      </div>
      <div
        className="absolute w-full h-1/5 bottom-0 z-10 text-center p-px opacity-0 hover:opacity-100 transition-fade duration-500 ease-default"
        onClick={(): Promise<void> => handleDeleteUser()}
      >
        <Image className="h-full bg-red-500" svg src={deleteIcon} />
      </div>
    </div>
  )
}
export default UsersListItem
