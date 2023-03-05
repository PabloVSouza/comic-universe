import { useMemo } from "react";
import { useParams } from "react-router-dom";

import Window from "components/Window";
import DownloadChapterHeader from "./components/Header";
import DownloadChapterList from "./components/List";
import DownloadChapterNav from "./components/Nav";

import useComicData from "store/comic";

import style from "./style.module.scss";

const Download = () => {
  const { id } = useParams();

  const { comic, getComicData, resetComic } = useComicData((state) => state);

  useMemo(() => {
    getComicData(id);
  }, []);

  return (
    !!comic.id && (
      <Window
        closebar
        to={"/"}
        onClick={() => resetComic()}
        className={style.downloadComic}
        contentClassName={style.content}
      >
        <DownloadChapterHeader />
        <DownloadChapterNav />

        <DownloadChapterList />
      </Window>
    )
  );
};

export default Download;
