import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useApi from 'api'
import LoadingOverlay from 'components/LoadingOverlay'
import Button from 'components/Button'
import UsersList from 'components/UsersComponents/UsersList'
import useLang from 'lang'
import { addGlobalDebugLog } from 'components/DebugConsole'

import confirmIcon from 'assets/confirm.svg'
import cancelIcon from 'assets/cancel.svg'

const Users = (): JSX.Element => {
  const { invoke } = useApi()
  const queryClient = useQueryClient()

  // Initialize debug logging
  useEffect(() => {
    addGlobalDebugLog('🚀 Users component loaded - Debug mode active')
    addGlobalDebugLog('📝 Ready to test user creation functionality')
  }, [])

  const { data: users, isLoading } = useQuery({
    queryKey: ['userData'],
    queryFn: async () => await invoke('dbGetAllUsers'),
    initialData: []
  })

  const [newUser, setNewUser] = useState(false)
  const [name, setName] = useState('')

  const lang = useLang()

  const { mutate: createUser, isLoading: isCreating } = useMutation({
    mutationFn: async () => {
      addGlobalDebugLog(`Creating user with name: "${name}"`)
      const requestPayload = { request: { user: { id: 0, name, default: false } } }
      addGlobalDebugLog(`Payload: ${JSON.stringify(requestPayload)}`)
      const result = await invoke('dbUpdateUser', requestPayload)
      addGlobalDebugLog(`User creation result: ${JSON.stringify(result)}`)
      return result
    },
    onSuccess: (data) => {
      addGlobalDebugLog(`✅ User created successfully: ${JSON.stringify(data)}`)
      setNewUser(false)
      setName('')
      queryClient.invalidateQueries({ queryKey: ['userData'] })
    },
    onError: (error) => {
      addGlobalDebugLog(`❌ Failed to create user: ${error.toString()}`)
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
              onClick={() => {
                addGlobalDebugLog(`🔘 Confirm button clicked, name: "${name}"`)
                if (name.trim()) {
                  addGlobalDebugLog('✅ Name is valid, calling createUser')
                  createUser()
                } else {
                  addGlobalDebugLog('❌ Name is empty, not creating user')
                }
              }}
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
