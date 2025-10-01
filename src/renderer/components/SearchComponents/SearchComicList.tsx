import { FC, useEffect, useState, useRef } from 'react'
import classNames from 'classnames'
import SearchComicListItem from 'components/SearchComponents/SearchComicListItem'

interface SearchComicListProps {
  className?: string
  list: IComic[]
  itemsPerPage?: number
  offset: number
}

const SearchComicList: FC<SearchComicListProps> = ({
  className,
  list,
  itemsPerPage = 10,
  offset
}) => {
  const refScrollElement = useRef<HTMLUListElement>(null)
  const endOffset = offset + itemsPerPage
  const currentItems = list?.slice(offset, endOffset)

  const [activeComic, setActiveComic] = useState({} as IComic)

  useEffect(() => {
    const { current } = refScrollElement
    if (current) current.scrollTop = 0
  }, [list])

  useEffect(() => {
    const { current } = refScrollElement
    if (current) current.scrollTop = 0
  }, [offset])

  return (
    <ul
      className={classNames(
        'w-full flex flex-grow flex-col overflow-auto gap-px',
        !list.length ? 'bg-default' : '',
        className
      )}
      ref={refScrollElement}
    >
      {currentItems.map((comic) => {
        return (
          <SearchComicListItem
            data={comic}
            id={comic.siteId}
            key={comic.siteId}
            activeComic={activeComic}
            setActiveComic={setActiveComic}
          />
        )
      })}
    </ul>
  )
}

export default SearchComicList
