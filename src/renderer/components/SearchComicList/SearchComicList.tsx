import { useState, useEffect, useRef, MutableRefObject } from 'react'
import ReactPaginate from 'react-paginate'
import SearchComicListItem from './SearchComicListItem/SearchComicListItem'
import useLang from 'lang'

import style from './SearchComicList.module.scss'

interface SearchComicList {
  list: ComicInterface[]
  itemsPerPage?: number
}

const SearchComicList = ({ list, itemsPerPage = 10 }: SearchComicList): JSX.Element => {
  const [offset, setOffset] = useState(0)
  const [page, setPage] = useState(0)
  const refScrollElement = useRef() as MutableRefObject<HTMLUListElement>
  const endOffset = offset + itemsPerPage
  const currentItems = list?.slice(offset, endOffset)
  const totalPages = Math.ceil(list.length / itemsPerPage)

  const texts = useLang()

  const handlePageClick = (event): void => {
    setPage(event.selected)
    const newOffset = (event.selected * itemsPerPage) % list.length
    setOffset(newOffset)
  }

  useEffect(() => {
    setOffset(0)
    setPage(0)
    const { current } = refScrollElement
    if (current) current.scrollTop = 0
  }, [list])

  useEffect(() => {
    const { current } = refScrollElement
    if (current) current.scrollTop = 0
  }, [offset])

  return (
    <div className={style.SearchComicList}>
      <ul className={style.list} ref={refScrollElement}>
        {currentItems.map((comic) => {
          return <SearchComicListItem data={comic} id={comic.siteId} key={comic.siteId} />
        })}
      </ul>

      <ReactPaginate
        breakLabel="..."
        className={style.pagination}
        previousClassName={style.previous}
        breakClassName={style.break}
        nextClassName={style.next}
        pageClassName={style.page}
        activeClassName={style.active}
        forcePage={page}
        onPageChange={handlePageClick}
        pageRangeDisplayed={3}
        marginPagesDisplayed={3}
        pageCount={totalPages}
        nextLabel={texts.SearchComic.pagination.next}
        previousLabel={texts.SearchComic.pagination.previous}
      />
    </div>
  )
}

export default SearchComicList
