import { FC } from 'react'
import useApi from 'api'
import { useQuery } from '@tanstack/react-query'
import DisplayValue from 'components/DisplayValue'
import Image from 'components/Image'
import LoadingOverlay from 'components/LoadingOverlay'
import SettingsBox from '../SettingsBox'
import SettingsTitle from '../SettingsTitle'
import SettingsItem from '../SettingsItem'

import { iconIcon } from 'assets'

const SettingsAbout: FC = () => {
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
                <Image src={iconIcon} className="w-24 h-24 flex-shrink-0" />
                <div className="space-y-2">
                  <h1 className="text-3xl text-text-default">Comic Universe</h1>
                  <p className="text-base text-text-default opacity-70">{appData?.description}</p>
                </div>
              </div>

              {/* App Details */}
              <div className="space-y-4">
                <SettingsItem labelI18nKey="General.version">
                  <DisplayValue>{appVersion || appData?.version}</DisplayValue>
                </SettingsItem>

                <SettingsItem labelI18nKey="General.author">
                  <DisplayValue>{appData?.author}</DisplayValue>
                </SettingsItem>

                <SettingsItem labelI18nKey="General.license">
                  <DisplayValue>{appData?.license}</DisplayValue>
                </SettingsItem>
              </div>

              {/* Repository Link */}
              <div className="space-y-4">
                <SettingsItem
                  labelI18nKey="General.githubRepository"
                  descriptionI18nKey="Settings.about.repositoryDescription"
                >
                  <DisplayValue
                    href={appData?.repository}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-blue-400 inline-block"
                  >
                    {appData?.repository}
                  </DisplayValue>
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
