import { useState } from "react";
import classNames from "classnames";
import ReactHtmlParser from "react-html-parser";

import lang from "lang";
import Image from "components/Image";
import Button from "components/Button";

import style from "./style.module.scss";

const MangaListItem = ({ data }) => {
  const [extended, setExtended] = useState(false);
  const [mangaDetails, setMangaDetails] = useState(null);

  const handleClick = () => {
    setExtended(!extended);

    if (!mangaDetails) {
      window.electron.ipcRenderer
        .invoke("getMangaDetails", data.hash)
        .then((res) => {
          setMangaDetails(res[0]);
        });
    }
  };

  return (
    <li
      className={classNames(style.mangaListItem, !!extended && style.extended)}
      onClick={() => handleClick()}
    >
      <div className={style.name}>
        <h1 className={style.title}>{data.title}</h1>
        <p className={style.genre}>{data.genre}</p>
      </div>
      <div className={style.cover}>
        <div className={style.chapters}>{data.videos}</div>
        <Image className={style.coverImage} src={data.cover} />
      </div>
      {!!mangaDetails && extended && (
        <>
          <div className={style.synopsis}>
            {ReactHtmlParser(mangaDetails.synopsis)}
          </div>
          <div className={style.buttonArea}>
            <Button
              theme="roundedRectangle"
              size="xl"
              color="green"
              to={`/download/${data.slug}`}
            >
              {lang.SearchManga.goToPage}
            </Button>
          </div>
        </>
      )}
    </li>
  );
};

export default MangaListItem;
