import { useEffect, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import useApi from 'api'
import { useParams, useNavigate } from 'react-router-dom'
import slugify from 'slugify'
import Image from 'components/Image'
import FixFilePaths from 'functions/fixFilePaths'

import useGlobalStore from 'store/useGlobalStore'

import ReaderZoomWindow, { IMousePos } from 'components/ZoomWindow'
import useReaderStore from 'store/useReaderStore'
import useDashboardStore from 'store/useDashboardStore'

import loading from 'assets/loading.svg'
import Cover from 'components/Cover'

const Reader = (): JSX.Element => {
  // const navigate = useNavigate()
  const { invoke } = useApi()
  const { activeComic, setActiveComic } = useGlobalStore()
  const [chapterIndex, setChapterIndex] = useState(0)
  const [mousePos, setMousePos] = useState<IMousePos>({} as IMousePos)
  const [zoomVisible, setZoomVisible] = useState(false)
  const comicId = Number(useParams().comicId)
  const chapterId = Number(useParams().chapterId)

  useQuery({
    queryKey: ['activeComicData'],
    queryFn: async () => {
      const comicData = (await invoke('dbGetComicAdditionalData', {
        id: comicId
      })) as IComic
      if (!activeComic.id) setActiveComic(comicData)
      setChapterIndex(comicData.chapters.findIndex((val) => val.id === chapterId))
      return comicData
    }
  })

  const { mutate: updateReadProgress } = useMutation({
    mutationFn: async (readProgress: IReadProgress) => {
      await invoke('dbUpdateReadProgress', { readProgress })
    }
  })

  const chapter = activeComic.chapters ? activeComic.chapters[chapterIndex] : ({} as IChapter)

  const readProgress = chapter.ReadProgress

  useEffect(() => {
    if (!readProgress) {
      updateReadProgress()
    }
  }, [readProgress])

  // useEffect(() => {
  //   if (readProgress.page === 0) {
  //     const newReadProgress = { ...readProgress, page: 1 } as ReadProgressInterface
  //     setReadProgress(newReadProgress)
  //     setReadProgressDB(newReadProgress)
  //   }
  // }, [readProgress])

  // let chapter: ChapterInterface | undefined
  // let pages: Page[] | undefined

  // if (readProgress.id) {
  //   chapter = comic.chapters[chapterIndex] as ChapterInterface
  //   pages = JSON.parse(chapter.pages) as Page[]
  // }

  // const getPath = (page: Page): string =>
  //   !chapter?.offline
  //     ? (page?.path ?? '')
  //     : `file:///${window.path.join(
  //         appPath,
  //         'downloads',
  //         comic.repo,
  //         slugify(comic.name),
  //         slugify(chapter.number),
  //         page.filename
  //       )}`

  // const nextPage = async (): Promise<void> => {
  //   const { page, totalPages } = readProgress

  //   if (page < totalPages) {
  //     const newReadProgress = { ...readProgress, page: page + 1 } as ReadProgressInterface
  //     await setReadProgress(newReadProgress)
  //     await setReadProgressDB(newReadProgress)
  //   }
  //   if (page === totalPages) {
  //     if (chapterIndex === comic.chapters.length - 1) {
  //       await setComic(comic)
  //       navigate('/')
  //     }
  //     if (chapterIndex < comic.chapters.length - 1)
  //       navigate(`/reader/${comicId}/${comic.chapters[chapterIndex + 1].id}`)
  //   }
  // }

  // const previousPage = async (): Promise<void> => {
  //   const { page, totalPages } = readProgress
  //   if (totalPages >= page && page !== 1) {
  //     const newReadProgress = { ...readProgress, page: page - 1 } as ReadProgressInterface
  //     await setReadProgress(newReadProgress)
  //     await setReadProgressDB(newReadProgress)
  //   }
  //   if (page === 1) {
  //     if (chapterIndex === 0) {
  //       await setComic(comic)
  //       navigate('/')
  //     }
  //     if (chapterIndex <= comic.chapters.length - 1 && chapterIndex !== 0)
  //       navigate(`/reader/${comicId}/${comic.chapters[chapterIndex - 1].id}`)
  //   }
  // }

  // const handleKeys = (e: KeyboardEvent): void => {
  //   const keys = {
  //     ArrowLeft: (): void => {
  //       previousPage()
  //     },

  //     ArrowRight: async (): Promise<void> => {
  //       await nextPage()
  //     },

  //     Escape: async (): Promise<void> => {
  //       await setComic(comic)
  //       navigate('/')
  //     }
  //   }

  //   if (keys[e.key]) {
  //     keys[e.key]()
  //   }
  // }

  // const defineMousePos = (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
  //   setMousePos({ x: e.pageX, y: e.pageY })
  // }

  // const position = {
  //   transform: `translateX(-${(readProgress.page - 1) * 100}%)`
  // }

  // useEffect(() => {
  //   document.addEventListener('keydown', handleKeys)
  //   return () => {
  //     document.removeEventListener('keydown', handleKeys)
  //   }
  // }, [comic, chapterIndex, readProgress])

  // useEffect(() => {
  //   return () => {
  //     resetReader()
  //   }
  // }, [])

  return (
    <Cover visible>
      {/* <div
        className="w-full h-full relative overflow-hidden"
        onMouseMoveCapture={defineMousePos}
        onContextMenu={(): void => setZoomVisible(!zoomVisible)}
      >
        {!!pages?.length && (
          <ReaderZoomWindow
            mousePos={mousePos}
            image={FixFilePaths(pages[readProgress.page - 1].path) ?? ''}
            visible={zoomVisible}
          />
        )}
        <div className="h-full flex transition duration-500 ease-default" style={position}>
          {pages?.map((currentPage) => (
            <div
              key={currentPage.path}
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
                src={getPath(currentPage)}
                lazy
                placeholderSrc={loading}
                placeholderClassName="w-1/4"
              />
            </div>
          ))}
        </div>
      </div> */}
    </Cover>
  )
}

export default Reader
