import { useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import useApi from 'api'
import openWindow from 'functions/openWindow'
import HomeTopBar from 'components/HomeComponents/HomeTopBar'
import HomeComicList from 'components/HomeComponents/HomeComicList'
import HomeComicDashboard from 'components/HomeComponents/HomeDashboardComponents/HomeDashboard'
import HomeNav from 'components/HomeComponents/HomeNav'
import HomeBlankArea from 'components/HomeComponents/HomeBlankArea'
import WindowManager from 'components/WindowComponents/WindowManager'
import usePersistStore from 'store/usePersistStore'
import useDownloadStore from 'store/useDownloadStore'

const Home = (): JSX.Element => {
  const { invoke } = useApi()
  const { currentUser } = usePersistStore()
  const userActive = !!currentUser.id
  const { addToQueue } = useDownloadStore()

  const { data: comicList } = useQuery({
    queryKey: ['comicList'],
    queryFn: async () => (await invoke('dbGetAllComics')) as IComic[],
    initialData: []
  })

  const { mutate: addChaptersToQueue } = useMutation({
    mutationFn: async () => {
      const noPageChapters = await invoke('dbGetAllChaptersNoPage')

      addToQueue(noPageChapters[0])
    }
  })

  useEffect(() => {
    addChaptersToQueue()
  }, [comicList])

  useEffect(() => {
    if (!userActive) openWindow({ component: 'Users', props: {} })
  }, [userActive])

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
              <HomeComicDashboard comicList={comicList} />
            </>
          )}
        </div>
      </WindowManager>
    </div>
  )
}

export default Home
