import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactHtmlParser from 'react-html-parser'
import classNames from 'classnames'

import useComicData from 'store/comic'

import useLang from 'lang'

import Image from 'components/Image'
import Button from 'components/Button'

import style from './style.module.scss'

const ComicListItem = ({ data, ...props }) => {
  const navigate = useNavigate()

  const texts = useLang()

  const { selectedComic, setComic, getDetails } = useComicData((state) => state)

  useMemo(() => {
    if (!data.cover || !data.synopsis) {
      getDetails(data.id)
    }
  }, [])

  const extended = selectedComic.id === data.id

  const goToPage = () => {
    navigate(`/download/${selectedComic.id}`)
  }

  return (
    <li
      className={classNames(style.comicListItem, !!extended && style.extended)}
      onClick={() => setComic(data)}
      {...props}
    >
      <div className={style.content}>
        <div className={style.texts}>
          <h1 className={style.name}>{data.name}</h1>
          {!!data.publisher && <p className={style.publisher}>{data.publisher}</p>}
          {!!data.genres && (
            <p className={style.genre}>{!!data.genres && data.genres.join(', ')}</p>
          )}
          {!!data.status && <p className={style.status}>{data.status}</p>}
          {extended && <div className={style.synopsis}>{ReactHtmlParser(data.synopsis)}</div>}
        </div>
        <div className={style.cover}>
          {!!data.chapters && (
            <div className={style.chapters}>
              {data.totalChapters} {texts.SearchComic.chapters}
            </div>
          )}
          <Image className={style.coverImage} src={data.cover} />
        </div>
      </div>
      {extended && (
        <div className={style.buttonArea}>
          <Button theme="roundedRectangle" size="xl" color="green" onClick={() => goToPage()}>
            {texts.SearchComic.goToPage}
          </Button>
        </div>
      )}
    </li>
  )
}

export default ComicListItem
