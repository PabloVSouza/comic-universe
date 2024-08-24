import { useEffect, useRef, MutableRefObject } from 'react'
import classNames from 'classnames'
import SearchComicListItem from 'components/SearchComponents/SearchComicListItem'

interface ISearchComicList {
  className?: string
  list: ComicInterface[]
  itemsPerPage?: number
  offset: number
}

const SearchComicList = ({
  className,
  list,
  itemsPerPage = 10,
  offset
}: ISearchComicList): JSX.Element => {
  const refScrollElement = useRef() as MutableRefObject<HTMLUListElement>
  const endOffset = offset + itemsPerPage
  const currentItems = list?.slice(offset, endOffset)

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
        return <SearchComicListItem data={comic} id={comic.siteId} key={comic.siteId} />
      })}
    </ul>
  )
}

export default SearchComicList