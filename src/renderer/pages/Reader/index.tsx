import { useMemo, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import slugify from 'slugify'

import Image from 'components/Image'
import Modal from 'components/Modal'

import useGlobalStore from 'store/useGlobalStore'

import style from './style.module.scss'
import ZoomWindow, { MousePos } from './components/ZoomWindow'
import useReaderStore from 'store/useReaderStore'
import useDashboardStore from 'store/useDashboardStore'

const Reader = (): JSX.Element => {
  const navigate = useNavigate()

  const comicId = Number(useParams().comicId)
  const chapterId = Number(useParams().chapterId)

  const [mousePos, setMousePos] = useState<MousePos>({} as MousePos)
  const [zoomVisible, setZoomVisible] = useState(false)

  const { appPath } = useGlobalStore()

  const {
    page,
    chapters,
    readProgress,
    setInitialState,
    setReadProgressDB,
    getReadProgressDB,
    setPage,
    resetReader
  } = useReaderStore()

  const { comic, getReadProgressDB: getReadProgressDashboard } = useDashboardStore()

  useMemo(async () => {
    if (comicId && chapterId) await setInitialState(Number(comicId), chapterId)
  }, [])

  const chapterIndex = chapters.findIndex((val) => val.id === chapterId)

  const chapter = chapters[chapterIndex]

  const pages = chapter?.pages ? JSON.parse(chapter.pages) : []

  useMemo(() => {
    if (chapter?.id && readProgress?.page !== page) {
      setReadProgressDB(chapter, page)
      getReadProgressDB(chapter.id)
    }
  }, [page])

  const getPath = (page: Page): string =>
    !chapter.offline
      ? page.path
      : `file:///${window.path.join(
          appPath,
          'downloads',
          comic.repo,
          slugify(comic.name),
          slugify(chapter.number),
          page.filename
        )}`

  const nextPage = async (): Promise<void> => {
    if (page < pages.length - 1) setPage(page + 1)
    if (page === pages.length - 1) {
      const nextChapter = chapters[chapterIndex + 1]
      if (nextChapter && comicId) {
        setInitialState(comicId, nextChapter.id)
        navigate(`/reader/${comicId}/${nextChapter.id}`)
      }
    }
  }

  const previousPage = async (): Promise<void> => {
    if (page > 0) setPage(page - 1)
    if (page === 0 && chapterIndex > 0) {
      const previousChapter = chapters[chapterIndex - 1]
      if (previousChapter && comicId) {
        setInitialState(comicId, previousChapter.id)
        navigate(`/reader/${comicId}/${previousChapter.id}`)
      }
    }
  }

  const handleKeys = (e: KeyboardEvent): void => {
    const keys = {
      ArrowLeft: (): void => {
        previousPage()
      },

      ArrowRight: (): void => {
        nextPage()
      },

      Escape: (): void => {
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
    transform: `translateX(-${page * 100}%)`
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeys)
    return () => {
      document.removeEventListener('keydown', handleKeys)
    }
  }, [chapters, page, pages, setPage, chapterIndex])

  useEffect(() => {
    return () => {
      getReadProgressDashboard()
      resetReader()
    }
  }, [])

  return (
    <>
      <Modal modal="" />
      <div
        className={style.Reader}
        onMouseMoveCapture={defineMousePos}
        onContextMenu={(): void => setZoomVisible(!zoomVisible)}
      >
        {pages?.length > 0 && (
          <ZoomWindow
            mousePos={mousePos}
            image={getPath(pages[page] ?? pages[0])}
            visible={zoomVisible}
          />
        )}
        <div className={style.pages} style={position}>
          {pages?.map((currentPage) => (
            <div key={currentPage.filename} className={style.page}>
              <div className={style.buttons}>
                <button
                  className={style.btnPrevious}
                  onClick={(): Promise<void> => previousPage()}
                />
                <button className={style.btnNext} onClick={(): Promise<void> => nextPage()} />
              </div>
              <Image className={style.Image} pure src={getPath(currentPage)} />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default Reader
