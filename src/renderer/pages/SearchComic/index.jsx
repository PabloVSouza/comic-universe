import { useState, useMemo } from "react";
import Window from "components/Window";
import SearchComicList from "./components/SearchComicList";

import useComicData from "store/comic";

import lang from "lang";
import style from "./style.module.scss";

const SearchComic = () => {
  const [search, setSearch] = useState("");
  const [filteredList, setFilteredList] = useState([]);
  const { list } = useComicData((state) => state);

  const setList = () => {
    search.length > 0
      ? setFilteredList(
          list.filter((val) =>
            val.name.toUpperCase().startsWith(search.toUpperCase())
          )
        )
      : setFilteredList(list);
  };

  useMemo(() => {
    setList();
  }, [list, search]);

  return (
    <Window
      close
      className={style.searchComic}
      contentClassName={style.content}
      to="/"
    >
      <input
        className={style.input}
        placeholder={lang.SearchComic.textPlaceholder}
        type="text"
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className={style.result}>
        <SearchComicList list={filteredList} />
      </div>
    </Window>
  );
};

export default SearchComic;
