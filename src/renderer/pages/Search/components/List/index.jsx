import { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";

import ComicListItem from "./Item/Item";

import lang from "lang";

import style from "./style.module.scss";

const SearchComicList = ({ list, itemsPerPage = 10, reset }) => {
  const [offset, setOffset] = useState(0);
  const endOffset = offset + itemsPerPage;
  const currentItems = list.slice(offset, endOffset);
  const totalPages = Math.ceil(list.length / itemsPerPage);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % list.length;
    setOffset(newOffset);
  };

  return (
    <div className={style.searchComicList}>
      <ul className={style.list}>
        {currentItems.map((comic) => {
          return <ComicListItem data={comic} id={comic.id} key={comic.id} />;
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
        nextLabel={lang.SearchComic.pagination.next}
        previousLabel={lang.SearchComic.pagination.previous}
        renderOnZeroPageCount={null}
      />
    </div>
  );
};

export default SearchComicList;
