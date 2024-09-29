import { useEffect, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import useApi from 'api'
import { confirmAlert } from 'components/Alert'
import openWindow from 'functions/openWindow'
import HomeTopBar from 'components/HomeComponents/HomeTopBar'
import HomeComicList from 'components/HomeComponents/HomeComicList'
import HomeComicDashboard from 'components/HomeComponents/HomeDashboardComponents/HomeDashboard'
import HomeNav from 'components/HomeComponents/HomeNav'
import HomeBlankArea from 'components/HomeComponents/HomeBlankArea'
import WindowManager from 'components/WindowComponents/WindowManager'
import usePersistStore from 'store/usePersistStore'

const Home = (): JSX.Element => {
  const { invoke } = useApi()
  const { currentUser } = usePersistStore()
  const userActive = !!currentUser.id

  // Local state for the queue
  const [queue, setQueue] = useState<IChapter[]>([])
  const [inProgress, setInProgress] = useState<IChapter[]>([])

  // Query to get all comics
  const { data: comicList } = useQuery({
    queryKey: ['comicList'],
    queryFn: async () => (await invoke('dbGetAllComics')) as IComic[],
    initialData: []
  })

  // Mutation to fetch chapter pages
  const { mutate: fetchChapterPages } = useMutation({
    mutationFn: async (chapter: IChapter) => {
      const { repo } = chapter
      const pages = await invoke('getPages', { repo, data: { chapter } })

      if (pages.length > 0) {
        await invoke('dbUpdateChapter', { chapter: { ...chapter, pages: JSON.stringify(pages) } })
      }

      return pages.length > 0
    },
    onSuccess: (data, chapter) => {
      if (data) {
        removeFromQueue(chapter)
      }
    },
    onError: () => {
      confirmAlert({
        message: 'Failed to Download some Chapters Information'
      })
    },
    retry: 3 // Automatically retry up to 3 times if the request fails
  })

  // Add chapter to the queue
  const addToQueue = (chapter: IChapter) => {
    setQueue((prevQueue) => {
      if (!prevQueue.find((item) => item.id === chapter.id)) {
        return [...prevQueue, chapter]
      }
      return prevQueue
    })
  }

  // Remove chapter from the queue
  const removeFromQueue = (chapter: IChapter) => {
    setQueue((prevQueue) => prevQueue.filter((item) => item.id !== chapter.id))
    setInProgress((prevInProgress) => prevInProgress.filter((item) => item.id !== chapter.id))
  }

  // Effect to add new chapters to the queue
  useEffect(() => {
    const addChaptersToQueue = async () => {
      const noPageChapters = await invoke('dbGetAllChaptersNoPage')
      noPageChapters.forEach((chapter) => addToQueue(chapter))
    }

    if (comicList && comicList.length > 0) {
      addChaptersToQueue()
    }
  }, [comicList])

  // Effect to handle chapter page fetching
  useEffect(() => {
    const notInProgress = queue.filter(
      (chapter) => !inProgress.find((item) => item.id === chapter.id)
    )
    if (notInProgress.length > 0) {
      setInProgress((prevInProgress) => [...prevInProgress, ...notInProgress])

      notInProgress.forEach((chapter) => {
        fetchChapterPages(chapter)
      })
    }
  }, [queue, inProgress, fetchChapterPages])

  // Effect to handle user status
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
