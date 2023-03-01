import { useMemo } from "react";
import { useParams } from "react-router-dom";

import Window from "components/Window";
import DownloadChapterHeader from "./components/Header";
import DownloadChapterList from "./components/List";
import DownloadChapterNav from "./components/Nav";

import useComicData from "store/comic";

import style from "./style.module.scss";

const DownloadComic = () => {
  const { id } = useParams();

  const { currentComic, getComicData } = useComicData((state) => state);

  useMemo(() => {
    getComicData(id);
  }, []);

  return (
    !!currentComic.id && (
      <Window
        closebar
        to={"/"}
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

export default DownloadComic;
