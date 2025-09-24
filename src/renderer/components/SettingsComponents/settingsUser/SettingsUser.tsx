import { useQuery } from '@tanstack/react-query'
import useApi from 'api'
import LoadingOverlay from 'components/LoadingOverlay'
import SettingsBox from '../SettingsBox'
import SettingsTitle from '../SettingsTitle'
import UserProfile from './UserProfile'
import UserStatistics from './UserStatistics'
import UserDataManagement from './UserDataManagement'
import UserPreferences from './UserPreferences'

const SettingsUser = () => {
  const { invoke } = useApi()

  const { isLoading } = useQuery({
    queryKey: ['userData'],
    queryFn: async () => await invoke('dbGetAllUsers'),
    initialData: []
  })

  return (
    <div className="h-full w-full flex flex-col relative">
      <SettingsTitle i18nKey="Settings.user.title" variant="main" />

      <div className="flex-1 overflow-y-auto pt-20 p-6">
        <div className="mx-auto space-y-8">
          <SettingsBox>
            <div className="flex flex-col gap-8">
              <UserProfile />
              <UserPreferences />
            </div>
          </SettingsBox>

          <SettingsBox>
            <UserStatistics />
          </SettingsBox>

          <SettingsBox>
            <UserDataManagement />
          </SettingsBox>
        </div>
      </div>

      <LoadingOverlay isLoading={isLoading} />
    </div>
  )
}

export default SettingsUser
