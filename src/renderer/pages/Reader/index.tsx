import { useMemo, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import slugify from 'slugify'

import Image from 'components/Image'
import Modal from 'components/Modal'

import useGlobalStore from 'store/useGlobalStore'

import style from './style.module.scss'
import ZoomWindow, { MousePos } from './components/ZoomWindow'
import useDashboardStore from 'store/useDashboardStore'

const Reader = (): JSX.Element => {
  const navigate = useNavigate()

  const { comicId, chapterId } = useParams()

  const [mousePos, setMousePos] = useState<MousePos>({} as MousePos)
  const [zoomVisible, setZoomVisible] = useState(false)
  const [page, setPage] = useState(0)

  const { appPath } = useGlobalStore()
  const { comic, chapters, list, readProgress, getReadProgressDB, setReadProgress, setComic } =
    useDashboardStore()

  useMemo(() => {
    if (!comic._id) {
      const foundComic = list.find((val) => val._id === comicId)
      if (foundComic) setComic(foundComic)
    }
  }, [])

  const chapterIndex = chapters.findIndex((val) => val._id === chapterId)

  const chapter = chapters[chapterIndex]

  const pages = chapter?.pages

  const currentProgress = readProgress.find((val) => val.chapterId === chapterId)

  useMemo(() => {
    if (page === 0 && currentProgress) setPage(currentProgress.page)
  }, [])

  useMemo(() => {
    setReadProgress(chapter, page)
    getReadProgressDB()
  }, [page])

  const getPath = (page: Page): string =>
    page.path.startsWith('http')
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
      if (nextChapter) {
        setPage(0)
        navigate(`/reader/${comicId}/${nextChapter._id}`)
      }
    }
  }

  const previousPage = async (): Promise<void> => {
    if (page > 0) setPage(page - 1)
    if (page === 0 && chapterIndex > 0) {
      const previousChapter = chapters[chapterIndex - 1]
      if (previousChapter) {
        setPage(previousChapter.pages.length - 1)
        navigate(`/reader/${comicId}/${previousChapter._id}`)
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

  useEffect(() => {
    document.addEventListener('keydown', handleKeys)
    return () => {
      document.removeEventListener('keydown', handleKeys)
    }
  }, [chapters, page, pages, setPage, chapterIndex])

  const position = {
    transform: `translateX(-${page * 100}%)`
  }

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
