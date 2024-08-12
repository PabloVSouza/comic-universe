import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import slugify from 'slugify'
import Image from 'components/Image/Image'

import useGlobalStore from 'store/useGlobalStore'

import style from './Reader.module.scss'
import ReaderZoomWindow, {
  MousePos
} from '../../components/ReaderComponents/ReaderZoomWindow/ReaderZoomWindow'
import useReaderStore from 'store/useReaderStore'
import useDashboardStore from 'store/useDashboardStore'

import loading from 'assets/loading.svg'
import Cover from 'components/Cover'

const Reader = (): JSX.Element => {
  const navigate = useNavigate()

  const comicId = Number(useParams().comicId)
  const chapterId = Number(useParams().chapterId)

  const [mousePos, setMousePos] = useState<MousePos>({} as MousePos)
  const [zoomVisible, setZoomVisible] = useState(false)

  const { appPath } = useGlobalStore()

  const {
    chapterIndex,
    readProgress,
    resetReader,
    setInitialState,
    setReadProgress,
    setReadProgressDB
  } = useReaderStore()

  const { comic, setComic } = useDashboardStore()

  useEffect(() => {
    setInitialState(comicId, chapterId)
  }, [chapterId])

  useEffect(() => {
    if (readProgress.page === 0) {
      const newReadProgress = { ...readProgress, page: 1 } as ReadProgressInterface
      setReadProgress(newReadProgress)
      setReadProgressDB(newReadProgress)
    }
  }, [readProgress])

  let chapter: ChapterInterface | undefined
  let pages: Page[] | undefined

  if (readProgress.id) {
    chapter = comic.chapters[chapterIndex] as ChapterInterface
    pages = JSON.parse(chapter.pages) as Page[]
  }

  const getPath = (page: Page): string =>
    !chapter?.offline
      ? (page?.path ?? '')
      : `file:///${window.path.join(
          appPath,
          'downloads',
          comic.repo,
          slugify(comic.name),
          slugify(chapter.number),
          page.filename
        )}`

  const nextPage = async (): Promise<void> => {
    const { page, totalPages } = readProgress

    if (page < totalPages) {
      const newReadProgress = { ...readProgress, page: page + 1 } as ReadProgressInterface
      await setReadProgress(newReadProgress)
      await setReadProgressDB(newReadProgress)
    }
    if (page === totalPages) {
      if (chapterIndex === comic.chapters.length - 1) {
        await setComic(comic.id)
        navigate('/')
      }
      if (chapterIndex < comic.chapters.length - 1)
        navigate(`/reader/${comicId}/${comic.chapters[chapterIndex + 1].id}`)
    }
  }

  const previousPage = async (): Promise<void> => {
    const { page, totalPages } = readProgress
    if (totalPages >= page && page !== 1) {
      const newReadProgress = { ...readProgress, page: page - 1 } as ReadProgressInterface
      await setReadProgress(newReadProgress)
      await setReadProgressDB(newReadProgress)
    }
    if (page === 1) {
      if (chapterIndex === 0) {
        await setComic(comic.id)
        navigate('/')
      }
      if (chapterIndex <= comic.chapters.length - 1 && chapterIndex !== 0)
        navigate(`/reader/${comicId}/${comic.chapters[chapterIndex - 1].id}`)
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
        await setComic(comic.id)
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
    transform: `translateX(-${(readProgress.page - 1) * 100}%)`
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeys)
    return () => {
      document.removeEventListener('keydown', handleKeys)
    }
  }, [comic, chapterIndex, readProgress])

  useEffect(() => {
    return () => {
      resetReader()
    }
  }, [])

  return (
    <Cover visible>
      <div
        className={style.Reader}
        onMouseMoveCapture={defineMousePos}
        onContextMenu={(): void => setZoomVisible(!zoomVisible)}
      >
        {!!pages?.length && (
          <ReaderZoomWindow
            mousePos={mousePos}
            image={getPath(pages[readProgress.page - 1]) ?? ''}
            visible={zoomVisible}
          />
        )}
        <div className={style.pages} style={position}>
          {pages?.map((currentPage) => (
            <div key={currentPage.path} className={style.page}>
              <div className={style.buttons}>
                <button
                  className={style.btnPrevious}
                  onClick={(): Promise<void> => previousPage()}
                />
                <button className={style.btnNext} onClick={(): Promise<void> => nextPage()} />
              </div>
              <Image
                className={style.Image}
                src={getPath(currentPage)}
                lazy
                placeholderSrc={loading}
                placeholderClassName={style.ImageLoading}
              />
            </div>
          ))}
        </div>
      </div>
    </Cover>
  )
}

export default Reader
