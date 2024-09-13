import useApi from 'api'
import { useQuery } from '@tanstack/react-query'
import Image from 'components/Image'
import LoadingOverlay from 'components/LoadingOverlay'

import appIcon from 'assets/icon.svg'

const { invoke } = useApi()

const About = (): JSX.Element => {
  const { data: appData, isLoading } = useQuery({
    queryKey: ['appData'],
    queryFn: async () => await invoke('getAppData')
  })

  return (
    <>
      <LoadingOverlay isLoading={isLoading} />
      <Image src={appIcon} className="w-1/3 aspect-square flex-shrink-0" />
      <div className="flex flex-grow h-full flex-col items-center justify-center text-center gap-1">
        <h1 className="text-3xl">Comic Universe</h1>
        <p>Ver: {appData?.version}</p>
        <p>Author: {appData?.author}</p>
        <p>License: {appData?.license}</p>
        {appData?.description
          .split('. ')
          .map((description) => <p key={description}>{description}.</p>)}
        <a href={appData?.repository} target="_blank" rel="noreferrer" className="mt-2">
          <u>Github Repository</u>
        </a>
      </div>
    </>
  )
}

const windowSettings = {
  windowProps: {
    className: 'flex-grow',
    unique: true,
    closeable: true,
    title: 'About This App',
    contentClassName: 'flex-grow flex h-full w-full items-center justify-center p-8'
  },
  initialStatus: {
    startPosition: 'center',
    width: 550,
    height: 350
  }
} as TWindow

export default { About, ...windowSettings }
