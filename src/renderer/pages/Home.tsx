import { FC, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import useApi from 'api'
import openWindow from 'functions/openWindow'
import Cover from 'components/Cover'
import HomeTopBar from 'components/HomeComponents/HomeTopBar'
import HomeComicList from 'components/HomeComponents/HomeComicList'
import HomeComicDashboard from 'components/HomeComponents/HomeDashboardComponents/HomeDashboard'
import HomeNav from 'components/HomeComponents/HomeNav'
import HomeBlankArea from 'components/HomeComponents/HomeBlankArea'
import WindowManager from 'components/WindowComponents/WindowManager'
import usePersistSessionStore from 'store/usePersistSessionStore'
import useGlobalStore from 'store/useGlobalStore'
import useWindowManagerStore from 'store/useWindowManagerStore'
import useQueue from 'hooks/useQueue'
import useFetchData from 'hooks/useFetchData'
import useAutoWebsiteAuth from 'hooks/useAutoWebsiteAuth'
import { addChaptersToQueue } from 'functions/queueUtils'
import { HomeComicNav } from 'components/HomeComponents/HomeComicNav'

const Home: FC = () => {
  const { invoke } = useApi()
  const { currentUser } = usePersistSessionStore()
  const userActive = !!currentUser.id
  const { activeComic, setActiveComic } = useGlobalStore()
  const { currentWindows } = useWindowManagerStore()

  // Auto-authenticate with website on app startup
  useAutoWebsiteAuth()

  // Check if there are any active unique windows
  const hasUniqueWindows = currentWindows
    .filter((window) => !window.windowStatus.isMinimized)
    .some((window) => window.windowProps.unique)

  const { fetchChapterPages } = useFetchData(currentUser.id ?? '')

  const { addToQueue } = useQueue(fetchChapterPages)

  const { data: comicList } = useQuery<IComic[]>({
    queryKey: ['comicList', currentUser.id],
    queryFn: async () => (await invoke('dbGetAllComics', { userId: currentUser.id })) as IComic[],
    initialData: [],
    enabled: !!currentUser.id
  })

  useEffect(() => {
    addChaptersToQueue(comicList, addToQueue, invoke)
  }, [comicList, addToQueue, invoke])

  useEffect(() => {
    if (!userActive) openWindow({ component: 'Users', props: {} })
  }, [userActive])

  useEffect(() => {
    const inList = comicList.some((comic) => comic.id === activeComic.id)
    if (comicList.length) {
      if (!activeComic.id || !inList) setActiveComic(comicList[0])
    } else if (activeComic.id) {
      setActiveComic({} as IComic)
    }
  }, [activeComic.id, comicList, setActiveComic])

  return (
    <div className="w-full h-full flex-shrink-0 flex-grow flex flex-col justify-start items-center text-text-default">
      <HomeTopBar />
      <HomeNav />
      <WindowManager>
        <div className="flex h-full gap-px">
          <HomeBlankArea active={!userActive} />
          {userActive && (
            <div className="flex h-full flex-col w-60 mt-px gap-px">
              <HomeComicNav />
              <HomeComicList comicList={comicList} />
            </div>
          )}
          <HomeComicDashboard />
        </div>
      </WindowManager>

      {hasUniqueWindows && <Cover visible className="z-40" />}
    </div>
  )
}

export default Home
