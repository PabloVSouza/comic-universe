import { FC } from 'react'
import { useQuery } from '@tanstack/react-query'
import { iconIcon } from 'assets'
import { useApi } from 'hooks'
import { DisplayValue, Image, LoadingOverlay } from 'components/UiComponents'
import Box from '../Box'
import Item from '../Item'
import Title from '../Title'

const SettingsAbout: FC = () => {
  const { invoke } = useApi()
  const { data: appData, isLoading: appDataLoading } = useQuery({
    queryKey: ['appData'],
    queryFn: async () => {
      return await invoke<{
        version: string
        electronVersion: string
        chromeVersion: string
        nodeVersion: string
        v8Version: string
        platform: string
        arch: string
        description?: string
        author?: string
        license?: string
        repository?: string
      }>('getAppData')
    }
  })

  const { data: appVersion, isLoading: versionLoading } = useQuery({
    queryKey: ['appVersion'],
    queryFn: async () => await invoke<string>('getAppVersion')
  })

  const isLoading = appDataLoading || versionLoading

  return (
    <div className="h-full w-full flex flex-col relative">
      <Title i18nKey="Settings.about.title" variant="main" />

      <div className="flex-1 overflow-y-auto pt-20 p-6">
        <div className="mx-auto">
          <Box>
            <div className="space-y-6">
              {}
              <div className="flex flex-col items-center text-center space-y-4">
                <LoadingOverlay isLoading={isLoading} />
                <Image src={iconIcon} className="w-24 h-24 flex-shrink-0" />
                <div className="space-y-2">
                  <h1 className="text-3xl text-text-default">Comic Universe</h1>
                  <p className="text-base text-text-default opacity-70">{appData?.description}</p>
                </div>
              </div>

              {}
              <div className="space-y-4">
                <Item labelI18nKey="General.version">
                  <DisplayValue>{appVersion || appData?.version}</DisplayValue>
                </Item>

                <Item labelI18nKey="General.author">
                  <DisplayValue>{appData?.author}</DisplayValue>
                </Item>

                <Item labelI18nKey="General.license">
                  <DisplayValue>{appData?.license}</DisplayValue>
                </Item>
              </div>

              {}
              <div className="space-y-4">
                <Item
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
                </Item>
              </div>
            </div>
          </Box>
        </div>
      </div>
    </div>
  )
}

export default SettingsAbout
