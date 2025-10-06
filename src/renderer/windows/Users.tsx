import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useApi from 'api'
import { confirmIcon, cancelIcon } from 'assets'
import { Button, LoadingOverlay } from 'components/ui'
import { List } from 'components/UsersComponents'

const Users: FC = () => {
  const { invoke } = useApi()
  const queryClient = useQueryClient()

  const { data: users, isLoading } = useQuery({
    queryKey: ['userData'],
    queryFn: async () => await invoke('dbGetAllUsers'),
    initialData: []
  })

  const [newUser, setNewUser] = useState(false)

  const [name, setName] = useState('')

  const { t } = useTranslation()

  const { mutate: createUser } = useMutation({
    mutationFn: async () => await invoke('dbUpdateUser', { user: { name } }),
    onSuccess: () => {
      setNewUser(false)
      queryClient.invalidateQueries({ queryKey: ['userData'] })
    }
  })

  return (
    <>
      {newUser ? (
        <>
          <h1 className="text-2xl ">{t('Users.createButton')}</h1>
          <input
            className="w-11/12 p-2 border-none bg-default text-3xl rounded-lg"
            type="text"
            placeholder={t('Users.namePlaceholder')}
            onChange={(e): void => setName(e.target.value)}
          />
          <div className="">
            <Button
              icon={cancelIcon}
              theme="pure"
              size="xs"
              title={t('Users.cancelButton')}
              onClick={() => setNewUser(false)}
            />
            <Button
              icon={confirmIcon}
              theme="pure"
              size="xs"
              title={t('Users.createButton')}
              onClick={() => createUser()}
            />
          </div>
        </>
      ) : (
        <>
          <LoadingOverlay isLoading={isLoading} />
          <h1 className="text-2xl">{t('Users.header')}</h1>
          <List list={users} newUserAction={() => setNewUser(true)} />
        </>
      )}
    </>
  )
}

const getWindowSettings = () => {
  return {
    windowProps: {
      className: 'grow relative overflow-hidden',
      contentClassName:
        'flex w-full h-full flex-col justify-evenly items-center overflow-auto pt-5',
      maximizable: true,
      unique: true,
      title: 'Users' // Will be translated dynamically in openWindow
    },
    initialStatus: {
      startPosition: 'center',
      width: 500,
      height: 250
    }
  } as TWindow
}

export default { Users, ...getWindowSettings() }
