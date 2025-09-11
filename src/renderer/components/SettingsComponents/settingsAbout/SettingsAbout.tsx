import useApi from 'api'
import { useQuery } from '@tanstack/react-query'
import Image from 'components/Image'
import LoadingOverlay from 'components/LoadingOverlay'
import SettingsBox from '../SettingsBox'
import SettingsTitle from '../SettingsTitle'
import SettingsItem from '../SettingsItem'

import appIcon from 'assets/icon.svg'

const SettingsAbout = (): React.JSX.Element => {
  const { invoke } = useApi()
  const { data: appData, isLoading: appDataLoading } = useQuery({
    queryKey: ['appData'],
    queryFn: async () => await invoke('getAppData')
  })

  const { data: appVersion, isLoading: versionLoading } = useQuery({
    queryKey: ['appVersion'],
    queryFn: async () => await invoke('getAppVersion')
  })

  const isLoading = appDataLoading || versionLoading

  return (
    <div className="h-full w-full flex flex-col relative">
      <SettingsTitle i18nKey="Settings.about.title" variant="main" />

      <div className="flex-1 overflow-y-auto pt-20 p-6">
        <div className="mx-auto">
          <SettingsBox>
            <div className="space-y-6">
              {/* App Information */}
              <div className="flex flex-col items-center text-center space-y-4">
                <LoadingOverlay isLoading={isLoading} />
                <Image src={appIcon} className="w-24 h-24 flex-shrink-0" />
                <div className="space-y-2">
                  <h1 className="text-3xl text-text-default">Comic Universe</h1>
                  <p className="text-base text-text-default opacity-70">{appData?.description}</p>
                </div>
              </div>

              {/* App Details */}
              <div className="space-y-4">
                <SettingsItem labelI18nKey="General.version">
                  <div className="px-3 py-2 bg-list-item text-text-default rounded-lg border border-gray-200 dark:border-gray-600">
                    {appVersion || appData?.version}
                  </div>
                </SettingsItem>

                <SettingsItem labelI18nKey="General.author">
                  <div className="px-3 py-2 bg-list-item text-text-default rounded-lg border border-gray-200 dark:border-gray-600">
                    {appData?.author}
                  </div>
                </SettingsItem>

                <SettingsItem labelI18nKey="General.license">
                  <div className="px-3 py-2 bg-list-item text-text-default rounded-lg border border-gray-200 dark:border-gray-600">
                    {appData?.license}
                  </div>
                </SettingsItem>
              </div>

              {/* Repository Link */}
              <div className="space-y-4">
                <SettingsItem
                  labelI18nKey="General.githubRepository"
                  descriptionI18nKey="Settings.about.repositoryDescription"
                >
                  <a
                    href={appData?.repository}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 bg-list-item text-blue-600 dark:text-blue-400 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-block"
                  >
                    {appData?.repository}
                  </a>
                </SettingsItem>
              </div>
            </div>
          </SettingsBox>
        </div>
      </div>
    </div>
  )
}

export default SettingsAbout
