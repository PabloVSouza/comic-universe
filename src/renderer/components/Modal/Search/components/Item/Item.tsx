import { LiHTMLAttributes, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactHtmlParser from 'react-html-parser'
import classNames from 'classnames'

import useSearchStore from 'store/useSearchStore'

import useLang from 'lang'

import Image from 'components/Image'
import Button from 'components/Button'

import style from './style.module.scss'

interface ComicListItem extends LiHTMLAttributes<unknown> {
  data: Comic
}

const ComicListItem = ({ data }: ComicListItem): JSX.Element => {
  const navigate = useNavigate()

  const texts = useLang()

  const { comic, chapters, setComic, getDetails, getChapters } = useSearchStore((state) => state)

  const setActive = async (): Promise<void> => {
    await getChapters(data.siteId)
    setComic(data)
  }

  useMemo(() => {
    if (!data.cover || !data.synopsis) {
      getDetails(data.siteId)
    }
  }, [])

  const extended = comic.siteId === data.siteId

  const goToPage = (): void => {
    navigate(`/download/${comic.siteId}`)
  }

  return (
    <li
      className={classNames(style.comicListItem, !!extended && style.extended)}
      onClick={setActive}
    >
      <div className={style.content}>
        <div className={style.texts}>
          <h1 className={style.name}>{data.name}</h1>
          {!!data.publisher && <p className={style.publisher}>{data.publisher}</p>}
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
          <Button theme="roundedRectangle" size="xl" color="green" onClick={(): void => goToPage()}>
            {texts.SearchComic.bookmarkComic}
          </Button>
        </div>
      )}
    </li>
  )
}

export default ComicListItem
