import { useState, useEffect, useMemo } from "react";

import Window from "components/Window";
import SearchComicList from "pages/SearchComic/components/SearchComicList";

import lang from "lang";

import style from "./style.module.scss";

const { invoke } = window.electron.ipcRenderer;

const SearchComic = () => {
  const [comicList, setComicList] = useState([]);
  const [search, setSearch] = useState("");
  const [currentList, setCurrentList] = useState([]);

  useMemo(() => {
    invoke("getList", { type: "manga" }).then((res) => {
      setComicList(res);
      setCurrentList(res);
    });
  }, []);

  useEffect(() => {
    const filteredList = comicList.filter((val) =>
      val.title.toUpperCase().startsWith(search.toUpperCase())
    );

    setCurrentList(filteredList);
  }, [search]);

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
        <SearchComicList list={currentList} />
      </div>
    </Window>
  );
};

export default SearchComic;
