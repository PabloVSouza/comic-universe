import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactHtmlParser from "react-html-parser";
import classNames from "classnames";
import merge from "lodash.merge";

import useComicData from "store/comic";

import lang from "lang";
import Image from "components/Image";
import Button from "components/Button";

import style from "./style.module.scss";

const ComicListItem = ({ data, ...props }) => {
  const navigate = useNavigate();

  const { selectedComic, setComicData, getDetails } = useComicData(
    (state) => state
  );

  const extended = selectedComic.id === data.id;

  const expandItem = async () => {
    if (data.id !== selectedComic.id) {
      if (!data.synopsis) {
        getDetails(data.idSite);
      }
      setComicData({ selectedComic: data });
    }
  };

  const goToPage = () => {
    navigate(`/download/${selectedComic.id}`);
  };

  return (
    <li
      className={classNames(style.comicListItem, !!extended && style.extended)}
      onClick={() => expandItem()}
      {...props}
    >
      <div className={style.name}>
        <h1 className={style.title}>{data.name}</h1>
        <p className={style.genre}>{data.genres.join(", ")}</p>
      </div>
      <div className={style.cover}>
        <div className={style.chapters}>
          {data.totalChapters} {lang.SearchComic.chapters}
        </div>
        <Image className={style.coverImage} src={data.cover} />
      </div>
      {extended && (
        <>
          <div className={style.synopsis}>{ReactHtmlParser(data.synopsis)}</div>
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
