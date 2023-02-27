import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactHtmlParser from "react-html-parser";
import classNames from "classnames";
import merge from "lodash.merge";

import lang from "lang";
import Image from "components/Image";
import Button from "components/Button";

import style from "./style.module.scss";

const ComicListItem = ({ data }) => {
  const navigate = useNavigate();

  const [extended, setExtended] = useState(false);
  const [comicDetails, setComicDetails] = useState(null);

  const handleClick = () => {
    setExtended(!extended);

    if (!comicDetails) {
      window.electron.ipcRenderer
        .invoke("getComicDetails", data.hash)
        .then((res) => {
          setComicDetails(res[0]);
        });
    }
  };

  const goToPage = () => {
    // dispatch({ type: "SET_CURRENT_COMIC", payload: merge(data, comicDetails) });
    navigate(`/download/${data.slug}`);
  };

  return (
    <li
      className={classNames(style.comicListItem, !!extended && style.extended)}
      onClick={() => handleClick()}
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
      {!!comicDetails && extended && (
        <>
          <div className={style.synopsis}>
            {ReactHtmlParser(comicDetails.synopsis)}
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
