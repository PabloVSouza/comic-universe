import { useMemo, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import slugify from 'slugify'

import Image from 'components/Image'

import useGlobalStore from 'store/useGlobalStore'

import style from './style.module.scss'
import ZoomWindow, { MousePos } from './components/ZoomWindow'
import useReaderStore from 'store/useReaderStore'
import useDashboardStore from 'store/useDashboardStore'

const Reader = (): JSX.Element => {
  const navigate = useNavigate()

  const chapterId = Number(useParams().chapterId)

  const [mousePos, setMousePos] = useState<MousePos>({} as MousePos)
  const [zoomVisible, setZoomVisible] = useState(false)

  const { appPath } = useGlobalStore()

  const {
    chapterIndex,
    readProgress,
    resetReader,
    setChapterIndex,
    setInitialState,
    setReadProgress,
    setReadProgressDB
  } = useReaderStore()

  useEffect(() => {
    setInitialState(chapterId)
  }, [])

  const { comic, setComic } = useDashboardStore()

  const chapter = comic.chapters[chapterIndex] as ChapterInterface

  const pages = JSON.parse(chapter.pages) as Page[]

  useMemo(async () => {}, [])

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

  const nextPage = async (): Promise<void> => {}

  const previousPage = async (): Promise<void> => {}

  const handleKeys = (e: KeyboardEvent): void => {
    const keys = {
      ArrowLeft: (): void => {
        previousPage()
      },

      ArrowRight: (): void => {
        nextPage()
      },

      Escape: (): void => {
        setComic(comic)
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
    transform: `translateX(-${readProgress.page * 100}%)`
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeys)
    return () => {
      document.removeEventListener('keydown', handleKeys)
    }
  }, [])

  useEffect(() => {
    return () => {
      resetReader()
    }
  }, [])

  return (
    <>
      <div
        className={style.Reader}
        onMouseMoveCapture={defineMousePos}
        onContextMenu={(): void => setZoomVisible(!zoomVisible)}
      >
        {pages?.length > 0 && (
          <ZoomWindow
            mousePos={mousePos}
            image={getPath(pages[readProgress.page] ?? pages[0])}
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
