import { useState } from 'react'
import ReactPaginate from 'react-paginate'

import ComicListItem from './Item/Item'
import useLang from 'lang'

import style from './style.module.scss'

interface SearchComicList {
  list: ComicInterface[]
  itemsPerPage?: number
}

const SearchComicList = ({ list, itemsPerPage = 10 }: SearchComicList): JSX.Element => {
  const [offset, setOffset] = useState(0)
  const endOffset = offset + itemsPerPage
  const currentItems = list?.slice(offset, endOffset)
  const totalPages = Math.ceil(list.length / itemsPerPage)

  const texts = useLang()

  const handlePageClick = (event): void => {
    const newOffset = (event.selected * itemsPerPage) % list.length
    setOffset(newOffset)
  }

  return (
    <div className={style.searchComicList}>
      <ul className={style.list}>
        {currentItems.map((comic) => {
          return <ComicListItem data={comic} id={comic.siteId} key={comic.siteId} />
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