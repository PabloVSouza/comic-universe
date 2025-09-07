import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import useApi from 'api'
import openWindow from 'functions/openWindow'
import HomeTopBar from 'components/HomeComponents/HomeTopBar'
import HomeComicList from 'components/HomeComponents/HomeComicList'
import HomeComicDashboard from 'components/HomeComponents/HomeDashboardComponents/HomeDashboard'
import HomeNav from 'components/HomeComponents/HomeNav'
import HomeBlankArea from 'components/HomeComponents/HomeBlankArea'
import WindowManager from 'components/WindowComponents/WindowManager'
import usePersistSessionStore from 'store/usePersistSessionStore'
import useGlobalStore from 'store/useGlobalStore'
import useQueue from 'hooks/useQueue'
import useFetchData from 'hooks/useFetchData'
import { addChaptersToQueue } from 'functions/queueUtils'

const Home = (): React.JSX.Element => {
  const { invoke } = useApi()
  const { currentUser } = usePersistSessionStore()
  const userActive = !!currentUser.id
  const { activeComic, setActiveComic } = useGlobalStore()

  const { fetchChapterPages } = useFetchData()

  const { addToQueue } = useQueue(fetchChapterPages)

  const { data: comicList } = useQuery<IComic[]>({
    queryKey: ['comicList'],
    queryFn: async () => (await invoke('dbGetAllComics')) as IComic[],
    initialData: []
  })

  useEffect(() => {
    addChaptersToQueue(comicList, addToQueue, invoke)
  }, [comicList, addToQueue, invoke])

  useEffect(() => {
    if (!userActive) openWindow({ component: 'Users', props: {} })
  }, [userActive])

  useEffect(() => {
    const inList = comicList.includes(activeComic)
    if (comicList.length) {
      if (!activeComic.id || !inList) setActiveComic(comicList[0])
    } else if (activeComic.id) {
      setActiveComic({} as IComic)
    }
  }, [activeComic, comicList, setActiveComic])

  return (
    <div className="w-full h-full flex-shrink-0 flex-grow flex flex-col justify-start items-center text-text-default">
      <HomeTopBar />
      <HomeNav />
      <WindowManager>
        <div className="flex h-full gap-px">
          <HomeBlankArea active={!userActive} />
          {userActive && (
            <>
              <HomeComicList comicList={comicList} />
              <HomeComicDashboard />
            </>
          )}
        </div>
      </WindowManager>
    </div>
  )
}

export default Home
