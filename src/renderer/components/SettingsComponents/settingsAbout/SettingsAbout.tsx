import useApi from 'api'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import Image from 'components/Image'
import LoadingOverlay from 'components/LoadingOverlay'

import appIcon from 'assets/icon.svg'

const SettingsAbout = (): React.JSX.Element => {
  const { invoke } = useApi()
  const { t } = useTranslation()
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
    <div className="flex-grow h-full flex flex-col items-center justify-center text-center gap-1 p-8">
      <LoadingOverlay isLoading={isLoading} />
      <Image src={appIcon} className="w-1/4 aspect-square flex-shrink-0" />
      <div className="flex flex-grow h-full flex-col items-center justify-center text-center gap-1">
        <h1 className="text-3xl">Comic Universe</h1>
        <p>
          {t('General.version')}: {appVersion || appData?.version}
        </p>
        <p>
          {t('General.author')}: {appData?.author}
        </p>
        <p>
          {t('General.license')}: {appData?.license}
        </p>
        {}
        {appData?.description
          .split('. ')
          .map((description) => <p key={description}>{description}.</p>)}
        <a href={appData?.repository} target="_blank" rel="noreferrer" className="mt-2">
          <u>{t('General.githubRepository')}</u>
        </a>
      </div>
    </div>
  )
}

export default SettingsAbout
