import { useQuery } from '@tanstack/react-query'
import { useApi } from 'hooks'
import { LoadingOverlay } from 'components/UiComponents'
import Box from '../Box'
import Title from '../Title'
import UserDataManagement from './UserDataManagement'
import UserPreferences from './UserPreferences'
import UserProfile from './UserProfile'
import UserStatistics from './UserStatistics'

const SettingsUser = () => {
  const { invoke } = useApi()

  const { isLoading } = useQuery({
    queryKey: ['userData'],
    queryFn: async () => await invoke('dbGetAllUsers'),
    initialData: []
  })

  return (
    <div className="h-full w-full flex flex-col relative">
      <Title i18nKey="Settings.user.title" variant="main" />

      <div className="flex-1 overflow-y-auto pt-20 p-6">
        <div className="mx-auto space-y-8">
          <Box>
            <div className="flex flex-col gap-8">
              <UserProfile />
              <UserPreferences />
            </div>
          </Box>

          <Box>
            <UserStatistics />
          </Box>

          <Box>
            <UserDataManagement />
          </Box>
        </div>
      </div>

      <LoadingOverlay isLoading={isLoading} />
    </div>
  )
}

export default SettingsUser
