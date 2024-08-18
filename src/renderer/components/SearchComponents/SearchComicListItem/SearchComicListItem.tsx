import { LiHTMLAttributes, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactHtmlParser from 'react-html-parser'
import classNames from 'classnames'

import useSearchStore from 'store/useSearchStore'
import useDashboardStore from 'store/useDashboardStore'

import useLang from 'lang'

import loading from 'assets/loading.svg'
import Image from 'components/Image/Image'
import Button from 'components/Button/Button'

interface ComicListItem extends LiHTMLAttributes<unknown> {
  data: ComicInterface
}

const SearchComicListItem = ({ data }: ComicListItem): JSX.Element => {
  const texts = useLang()

  const navigate = useNavigate()

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
    navigate('/')
  }

  useMemo(() => {
    if (!data.cover || !data.synopsis) {
      getDetails({ siteId: data.siteId, siteLink: data.siteLink ?? '' })
    }
  }, [data])

  return (
    <li
      className={classNames(
        'h-48 bg-list-item hover:bg-list-item-hover hover:text-text-oposite flex flex-col transition-all duration-500 ease-default cursor-pointer',
        !!extended && 'h-96 hover:bg-list-item hover:text-text-default cursor-default'
      )}
      onClick={setActive}
    >
      <div className="flex h-full">
        <div className="flex-grow flex flex-col justify-center items-center p-3">
          <h1 className="text-2xl text-center">{ReactHtmlParser(data.name)}</h1>
          {!!data.publisher && <p className="text-xs">{data.publisher}</p>}
          {!!data.author && <p className="text-xs">{data.author}</p>}
          {!!data.genres && (
            <p className="text-sm">{!!data.genres && JSON.parse(data.genres).join(', ')}</p>
          )}
          {!!data.status && <p>{data.status}</p>}
          {extended && (
            <>
              <p className="mt-2">
                {chapters.length} {texts.SearchComic.availableChapters}
              </p>
              <div className="flex-grow h-px flex justify-center items-center my-2">
                <p className="overflow-auto max-h-full">{ReactHtmlParser(data.synopsis)}</p>
              </div>
              <div className="flex-shrink-0">
                <Button
                  size="xl"
                  color={existsInDB ? 'white' : 'green'}
                  onClick={addToList}
                  disabled={existsInDB}
                >
                  {existsInDB
                    ? texts.SearchComic.alreadyBookmarked
                    : texts.SearchComic.bookmarkComic}
                </Button>
              </div>
            </>
          )}
        </div>
        <Image
          className="h-auto aspect-10/16"
          placeholderClassName="h-full px-3 aspect-10/16"
          src={data.cover}
          lazy
          placeholderSrc={loading}
        />
      </div>
    </li>
  )
}

export default SearchComicListItem
