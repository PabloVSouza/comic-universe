import { LiHTMLAttributes, useMemo } from 'react'
import ReactHtmlParser from 'react-html-parser'
import classNames from 'classnames'

import useSearchStore from 'store/useSearchStore'
import useDashboardStore from 'store/useDashboardStore'

import useLang from 'lang'

import Image from 'components/Image'
import Button from 'components/Button'

import style from './style.module.scss'

interface ComicListItem extends LiHTMLAttributes<unknown> {
  data: Comic
}

const ComicListItem = ({ data }: ComicListItem): JSX.Element => {
  const texts = useLang()

  const { list } = useDashboardStore()

  const existsInDB = !!list.find((comic) => comic.siteId === data.siteId)

  const { comic, chapters, getDetails, getChapters, insertComic, setComic } = useSearchStore(
    (state) => state
  )

  const setActive = async (): Promise<void> => {
    await getChapters(data.siteId)
    setComic(data)
  }

  const extended = comic.siteId === data.siteId

  const addToList = (): void => {
    insertComic()
  }

  useMemo(() => {
    if (!data.cover || !data.synopsis) {
      getDetails({ siteId: data.siteId, siteLink: data.siteLink ?? '' })
    }
  }, [])

  return (
    <li
      className={classNames(style.comicListItem, !!extended && style.extended)}
      onClick={setActive}
    >
      <div className={style.content}>
        <div className={style.texts}>
          <h1 className={style.name}>{data.name}</h1>
          {!!data.publisher && <p className={style.publisher}>{data.publisher}</p>}
          {!!data.author && <p className={style.author}>{data.author}</p>}
          {!!data.genres && (
            <p className={style.genre}>{!!data.genres && data.genres.join(', ')}</p>
          )}
          {!!data.status && <p className={style.status}>{data.status}</p>}
          {extended && (
            <>
              <div className={style.chapters}>
                {chapters.length} {texts.SearchComic.availableChapters}
              </div>
              <div className={style.synopsis}>{ReactHtmlParser(data.synopsis)}</div>
            </>
          )}
        </div>
        <div className={style.cover}>
          <Image className={style.coverImage} src={data.cover} />
        </div>
      </div>
      {extended && (
        <div className={style.buttonArea}>
          <Button
            theme="roundedRectangle"
            size="xl"
            color={existsInDB ? 'white' : 'green'}
            onClick={addToList}
            disabled={existsInDB}
          >
            {existsInDB ? texts.SearchComic.alreadyBookmarked : texts.SearchComic.bookmarkComic}
          </Button>
        </div>
      )}
    </li>
  )
}

export default ComicListItem
