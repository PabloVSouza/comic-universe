import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useApi from 'api'
import LoadingOverlay from 'components/LoadingOverlay'
import Button from 'components/Button'
import UsersList from 'components/UsersComponents/UsersList'
import useLang from 'lang'

import confirmIcon from 'assets/confirm.svg'
import cancelIcon from 'assets/cancel.svg'

const Users = (): JSX.Element => {
  const { invoke } = useApi()
  const queryClient = useQueryClient()

  const { data: users, isLoading } = useQuery({
    queryKey: ['userData'],
    queryFn: async () => await invoke('dbGetAllUsers'),
    initialData: []
  })

  const [newUser, setNewUser] = useState(false)

  const [name, setName] = useState('')

  const lang = useLang()

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
          <h1 className="text-2xl ">{lang.Users.createButton}</h1>
          <input
            className="w-11/12 p-2 border-none bg-default text-3xl rounded-lg"
            type="text"
            placeholder={lang.Users.namePlaceholder}
            onChange={(e): void => setName(e.target.value)}
          />
          <div className="">
            <Button
              icon={cancelIcon}
              theme="pure"
              size="xs"
              title={lang.Users.cancelButton}
              onClick={() => setNewUser(false)}
            />
            <Button
              icon={confirmIcon}
              theme="pure"
              size="xs"
              title={lang.Users.createButton}
              onClick={() => createUser()}
            />
          </div>
        </>
      ) : (
        <>
          <LoadingOverlay isLoading={isLoading} />
          <h1 className="text-2xl">{lang.Users.header}</h1>
          <UsersList list={users} newUserAction={() => setNewUser(true)} />
        </>
      )}
    </>
  )
}

const windowSettings = {
  windowProps: {
    className: 'grow relative overflow-hidden',
    contentClassName: 'flex w-full h-full flex-col justify-evenly items-center overflow-auto pt-5',
    maximizable: true,
    unique: true,
    title: 'Users'
  },
  initialStatus: {
    startPosition: 'center',
    width: 500,
    height: 250
  }
} as TWindow

export default { Users, ...windowSettings }
