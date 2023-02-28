import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactHtmlParser from "react-html-parser";
import classNames from "classnames";
import merge from "lodash.merge";

import { useComicData } from "store/comic";

import lang from "lang";
import Image from "components/Image";
import Button from "components/Button";

import style from "./style.module.scss";

const ComicListItem = ({ data }) => {
  const navigate = useNavigate();

  const { currentComic, setComicData, resetComic } = useComicData(
    (state) => state
  );

  const extended = currentComic.slug === data.slug;

  const { invoke } = window.electron.ipcRenderer;

  const handleClick = async (e) => {
    if (e.target.localName !== "button" && !extended) {
      resetComic();
    }

    if (data.slug !== currentComic.slug) {
      const details = await invoke("getDetails", {
        type: "manga",
        id: data.hash,
      });

      const comicData = await merge(data, details);

      setComicData({ currentComic: comicData });
    }
  };

  const goToPage = () => {
    navigate(`/download/${currentComic.slug}`);
  };

  return (
    <li
      className={classNames(style.comicListItem, !!extended && style.extended)}
      onClick={(e) => handleClick(e)}
    >
      <div className={style.name}>
        <h1 className={style.title}>{data.title}</h1>
        <p className={style.genre}>{data.genre}</p>
      </div>
      <div className={style.cover}>
        <div className={style.chapters}>
          {data.videos} {lang.SearchComic.chapters}
        </div>
        <Image className={style.coverImage} src={data.cover} />
      </div>
      {extended && (
        <>
          <div className={style.synopsis}>
            {ReactHtmlParser(currentComic.synopsis)}
          </div>
          <div className={style.buttonArea}>
            <Button
              theme="roundedRectangle"
              size="xl"
              color="green"
              onClick={() => goToPage()}
            >
              {lang.SearchComic.goToPage}
            </Button>
          </div>
        </>
      )}
    </li>
  );
};

export default ComicListItem;
