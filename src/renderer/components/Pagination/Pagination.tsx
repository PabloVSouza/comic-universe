import ReactPaginate from 'react-paginate'
import { useState, useEffect } from 'react'
import classNames from 'classnames'
import useLang from 'lang/index'

interface IPagination {
  setOffset: (offset: number) => void
  itemsPerPage: number
  className?: string
  list: any[]
}

const Pagination = ({ setOffset, className, itemsPerPage, list, ...props }: IPagination) => {
  const lang = useLang()

  const [page, setPage] = useState(0)
  const totalPages = list.length / itemsPerPage

  const handlePageClick = (event): void => {
    const newOffset = (event.selected * itemsPerPage) % list.length
    setOffset(newOffset)
    setPage(event.selected)
  }

  const btnStyle =
    'flex justify-center items-center rounded h-1/2 cursor-pointer shadow-default shadow-black transition-all duration-500 ease-default'

  const linkStyle = 'h-full w-full flex justify-center items-center'

  useEffect(() => {
    setOffset(0)
    setPage(0)
  }, [list])

  return (
    <ReactPaginate
      breakLabel="..."
      className={classNames(
        'min-h-14 w-full flex-shrink-0 h-1 flex items-center justify-between flex-nowrap',
        className
      )}
      previousLinkClassName={linkStyle}
      nextLinkClassName={linkStyle}
      pageLinkClassName={linkStyle}
      breakLinkClassName={linkStyle}
      activeLinkClassName={linkStyle}
      pageClassName={classNames(btnStyle, 'bg-default/50 hover:bg-oposite/30 aspect-square')}
      previousClassName={classNames(
        btnStyle,
        'h-3/4 px-3 text-zinc-950 bg-lime-500/80 hover:bg-lime-500/100 '
      )}
      nextClassName={classNames(
        btnStyle,
        'h-3/4 px-3 text-zinc-950 bg-lime-500/80 hover:bg-lime-500/100'
      )}
      breakClassName={classNames(
        btnStyle,
        'text-zinc-950 aspect-square font-bold bg-zinc-50/50 hover:bg-zinc-50/80'
      )}
      activeClassName={classNames(
        btnStyle,
        'h-2/3 text-zinc-950 font-bold !bg-zinc-50/70 hover:!bg-zinc-50/90'
      )}
      forcePage={page}
      onPageChange={handlePageClick}
      pageRangeDisplayed={2}
      marginPagesDisplayed={2}
      pageCount={totalPages}
      nextLabel={lang.Pagination.next}
      previousLabel={lang.Pagination.previous}
      {...props}
    />
  )
}

export default Pagination
