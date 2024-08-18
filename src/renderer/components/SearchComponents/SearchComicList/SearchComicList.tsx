import { useEffect, useRef, MutableRefObject } from 'react'
import SearchComicListItem from '../SearchComicListItem/SearchComicListItem'

interface SearchComicList {
  list: ComicInterface[]
  itemsPerPage?: number
  offset: number
}

const SearchComicList = ({ list, itemsPerPage = 10, offset }: SearchComicList): JSX.Element => {
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
    <ul className="w-full flex flex-grow flex-col overflow-auto gap-px" ref={refScrollElement}>
      {currentItems.map((comic) => {
        return <SearchComicListItem data={comic} id={comic.siteId} key={comic.siteId} />
      })}
    </ul>
  )
}

export default SearchComicList
