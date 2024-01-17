import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import style from './style.module.scss'
import useDashboardStore from 'store/useDashboardStore'
import useReaderStore from 'store/useReaderStore'
import ReaderManga from 'components/ReaderComponents/ReaderManga/ReaderManga'
import ReaderHQ from 'components/ReaderComponents/ReaderHQ/ReaderHQ'
import ReaderManhwa from 'components/ReaderComponents/ReaderManhwa/ReaderManhwa'

const Reader = (): JSX.Element => {
  const comicId = Number(useParams().comicId)
  const chapterId = Number(useParams().chapterId)

  const { comic } = useDashboardStore()
  const { setInitialState, resetReader } = useReaderStore()

  useEffect(() => {
    setInitialState(comicId, chapterId)
  }, [chapterId])

  useEffect(() => {
    return () => {
      resetReader()
    }
  }, [])

  return (
    <div className={style.Reader}>
      {comic.type === 'manga' && <ReaderManga comicId={comicId} />}
      {comic.type === 'manhwa' && <ReaderManhwa comicId={comicId} />}
      {comic.type === 'hq' && <ReaderHQ comicId={comicId} />}
    </div>
  )
}

export default Reader
