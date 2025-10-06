import { FC, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { openWindow, addChaptersToQueue } from 'functions'
import { useApi, useAutoWebsiteAuth, useQueue, useFetchData } from 'hooks'
import { useGlobalStore, usePersistSessionStore, useWindowManagerStore } from 'store'
import { BlankArea, ComicList, ComicNav, Dashboard, Nav, TopBar } from 'components/HomeComponents'
import { Cover } from 'components/UiComponents'
import { WindowManager } from 'components/WindowComponents'

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
    queryFn: async () => await invoke<IComic[]>('dbGetAllComics', { userId: currentUser.id }),
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
      <TopBar />
      <Nav />
      <WindowManager>
        <div className="flex h-full gap-px">
          <BlankArea />
          {userActive && (
            <div className="flex h-full flex-col w-60 mt-px gap-px">
              <ComicNav />
              <ComicList comicList={comicList} />
            </div>
          )}
          <Dashboard />
        </div>
      </WindowManager>

      {hasUniqueWindows && <Cover visible className="z-40" />}
    </div>
  )
}

export default Home
