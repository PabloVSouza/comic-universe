import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import useApi from 'api'
import { plusIcon, userIcon, trashIcon } from 'assets'
import classNames from 'classnames'
import { confirmAlert } from 'components/ui'
import { Image } from 'components/ui'
import usePersistSessionStore from 'store/usePersistSessionStore'
import useWindowManagerStore from 'store/useWindowManagerStore'

interface UserListItemProps {
  data?: IUser
  newUser?: boolean
  newUserAction?: () => void
}

const UsersListItem: FC<UserListItemProps> = ({ data, newUser, newUserAction }) => {
  const { t } = useTranslation()
  const { invoke } = useApi()
  const queryClient = useQueryClient()

  const { mutate: deleteUser } = useMutation({
    mutationFn: async (id: string) => await invoke('dbDeleteUser', { id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userData'] })
  })

  const { setCurrentUser } = usePersistSessionStore()
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
    }
  }

  const id = data?.id ?? 0

  const handleDeleteUser = async (): Promise<void> => {
    if (id) {
      confirmAlert({
        title: t('Users.deleteUser.deleteUserTitle'),
        message: t('Users.deleteUser.deleteUserMessage'),
        buttons: [
          {
            label: t('Users.deleteUser.confirmDeleteButton'),
            action: () => deleteUser(id)
          },
          {
            label: t('Users.deleteUser.cancelDeleteButton')
          }
        ]
      })
    }
    return new Promise((resolve) => resolve())
  }

  const baseStyling =
    'w-24 rounded-full aspect-square cursor-pointer shrink-0 flex justify-center items-center overflow-clip relative border border-white bg-light/60 hover:bg-light/80 transition-all duration-500 ease-default box-border'

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
        <p className="w-full text-text-dark text-center py-1 absolute bottom-0 bg-light">
          {data?.name}
        </p>
      </div>
      <div
        className="absolute w-full h-1/5 bottom-0 z-10 text-center p-px opacity-0 hover:opacity-100 transition-fade duration-500 ease-default"
        onClick={(): Promise<void> => handleDeleteUser()}
      >
        <Image className="h-full bg-red-500" svg src={trashIcon} />
      </div>
    </div>
  )
}
export default UsersListItem
