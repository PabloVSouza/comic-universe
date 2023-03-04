import { useState, useMemo } from "react";
import Window from "components/Window";
import SearchComicList from "./components/List";

import useComicData from "store/comic";

import lang from "lang";
import style from "./style.module.scss";

const SearchComic = () => {
  const [search, setSearch] = useState("");
  const [filteredList, setFilteredList] = useState([]);
  const { list, resetComic } = useComicData((state) => state);

  const setList = () => {
    search.length > 0
      ? setFilteredList(
          list.filter((val) =>
            val.name.toUpperCase().startsWith(search.toUpperCase())
          )
        )
      : setFilteredList(list);
  };

  const handle = () => {
    console.log("Oi");
  };

  useMemo(() => {
    if (list.length == 0) {
      setList();
    }
  }, []);

  useMemo(() => {
    setList();
  }, [list, search]);

  return (
    <Window
      close
      to={"/"}
      onClick={() => resetComic()}
      className={style.searchComic}
      contentClassName={style.content}
    >
      <div className={style.searchInput}>
        <input
          className={style.input}
          placeholder={lang.SearchComic.textPlaceholder}
          type="text"
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className={style.searchIcon} />
      </div>
      <div className={style.result}>
        <SearchComicList list={filteredList} />
      </div>
    </Window>
  );
};

export default SearchComic;
