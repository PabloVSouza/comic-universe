import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import Image from 'components/Image'
import useApi from 'api'
import FixFilePaths from 'functions/fixFilePaths'
import useGlobalStore from 'store/useGlobalStore'
import usePersistStore from 'store/usePersistStore'
import ReaderZoomWindow, { IMousePos } from 'components/ZoomWindow'

import loading from 'assets/loading.svg'
import Cover from 'components/Cover'

const Reader = (): JSX.Element => {
  const navigate = useNavigate()
  const { invoke } = useApi()
  const queryClient = useQueryClient()
  const { activeComic, setActiveComic } = useGlobalStore()
  const { currentUser } = usePersistStore()
  const [mousePos, setMousePos] = useState<IMousePos>({} as IMousePos)
  const [zoomVisible, setZoomVisible] = useState(false)
  const comicId = Number(useParams().comicId)
  const chapterId = Number(useParams().chapterId)

  useQuery({
    queryKey: ['activeComicData'],
    queryFn: async () => {
      const comicData = (await invoke('dbGetComicAdditionalData', {
        id: comicId,
        userId: currentUser.id
      })) as IComic
      if (!activeComic.id) setActiveComic(comicData)
      return comicData
    },
    enabled: !!currentUser.id && !activeComic.id
  })

  const chapter = activeComic?.chapters?.find((val) => val.id == chapterId)
  const chapters = activeComic?.chapters
  const chapterIndex = chapters.findIndex((val) => val.id === chapterId) ?? 0
  const pages = JSON.parse(chapter?.pages ?? '[]') as IPage[]

  const getReadProgress = async () => {
    let result = await invoke('dbGetReadProgress', { chapterId, userId: currentUser.id })
    if (!result.length) {
      await invoke('dbUpdateReadProgress', {
        readProgress: {
          chapterId,
          comicId,
          page: 1,
          userId: currentUser.id ?? 0,
          totalPages: pages.length ?? 0
        }
      })
      result = await invoke('dbGetReadProgress', { chapterId, userId: currentUser.id })
    }

    return result[0] as IReadProgress
  }

  const { data: readProgress } = useQuery({
    queryKey: ['readProgressData'],
    queryFn: async () => await getReadProgress(),
    enabled: !!activeComic.id && !!currentUser.id && !!chapter?.pages.length
  })

  const resetQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['activeComicData'] })
    queryClient.invalidateQueries({ queryKey: ['readProgressData'] })
  }

  const { mutate: updateReadProgress } = useMutation({
    mutationFn: async (readProgress: IReadProgress) => {
      await invoke('dbUpdateReadProgress', { readProgress })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['readProgressData'] })
  })

  useEffect(() => {
    if (readProgress && readProgress.page === 0) {
      const newReadProgress = { ...readProgress, page: 1 } as IReadProgress
      updateReadProgress(newReadProgress)
    }
  }, [readProgress])

  const nextPage = async (): Promise<void> => {
    if (readProgress) {
      const { page, totalPages } = readProgress

      if (page < totalPages) {
        const newReadProgress = { ...readProgress, page: page + 1 } as IReadProgress
        updateReadProgress(newReadProgress)
      }

      if (page === totalPages) {
        console.log(chapterIndex, chapters.length)
        if (chapterIndex === chapters.length - 1) navigate('/')

        if (chapterIndex < activeComic.chapters.length - 1)
          navigate(`/reader/${comicId}/${activeComic.chapters[chapterIndex + 1].id}`)
      }
    }
  }

  const previousPage = async (): Promise<void> => {
    if (readProgress) {
      const { page, totalPages } = readProgress
      if (totalPages >= page && page !== 1) {
        const newReadProgress = { ...readProgress, page: page - 1 } as IReadProgress
        updateReadProgress(newReadProgress)
      }
      if (page === 1) {
        if (chapterIndex === 0) navigate('/')

        if (chapterIndex <= activeComic.chapters.length - 1 && chapterIndex !== 0)
          navigate(`/reader/${comicId}/${activeComic.chapters[chapterIndex - 1].id}`)
      }
    }
  }

  const handleKeys = (e: KeyboardEvent): void => {
    const keys = {
      ArrowLeft: (): void => {
        previousPage()
      },

      ArrowRight: async (): Promise<void> => {
        await nextPage()
      },

      Escape: async (): Promise<void> => {
        navigate('/')
      }
    }

    if (keys[e.key]) {
      keys[e.key]()
    }
  }

  const defineMousePos = (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    setMousePos({ x: e.pageX, y: e.pageY })
  }

  const position = {
    transform: `translateX(-${((readProgress?.page ?? 1) - 1) * 100}%)`
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeys)
    return () => {
      document.removeEventListener('keydown', handleKeys)
    }
  }, [activeComic, chapterIndex, readProgress])

  useEffect(() => {
    resetQueries()
  }, [chapterId])
  return (
    <Cover visible>
      <div
        className="w-full h-full relative overflow-hidden"
        onMouseMoveCapture={defineMousePos}
        onContextMenu={(): void => setZoomVisible(!zoomVisible)}
      >
        {!!pages?.length && readProgress?.page && (
          <ReaderZoomWindow
            mousePos={mousePos}
            image={FixFilePaths(pages[readProgress.page - 1].path) ?? ''}
            visible={zoomVisible}
          />
        )}
        <div className="h-full flex transition duration-500 ease-default" style={position}>
          {!!pages.length &&
            pages?.map((page) => (
              <div
                key={page.path}
                className="h-full w-full shrink-0 overflow-hidden flex justify-center align-center"
              >
                <div className="absolute w-screen h-screen flex justify-between">
                  <button
                    className="w-24 h-full transition duration-500 ease-default bg-transparent border-none cursor-pointer hover:bg-light"
                    onClick={(): Promise<void> => previousPage()}
                  />
                  <button
                    className="w-24 h-full transition duration-500 ease-default bg-transparent border-none cursor-pointer hover:bg-light"
                    onClick={(): Promise<void> => nextPage()}
                  />
                </div>
                <Image
                  className="w-full h-full object-contain"
                  src={page.path}
                  lazy
                  placeholderSrc={loading}
                  placeholderClassName="w-1/4"
                />
              </div>
            ))}
        </div>
      </div>
    </Cover>
  )
}

export default Reader
