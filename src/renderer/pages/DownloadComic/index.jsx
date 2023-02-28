import { useMemo } from "react";
import { useParams } from "react-router-dom";
import merge from "lodash.merge";

import { useComicData } from "store/comic";

import Window from "components/Window";
import DownloadChapterHeader from "./components/DownloadChapterHeader";
import DownloadChapterList from "./components/DownloadChapterList";
import DownloadChapterNav from "./components/DownloadChapterNav";

import style from "./style.module.scss";

const DownloadComic = () => {
  const { slug } = useParams();

  const { currentComic, getChapters } = useComicData((state) => state);

  useMemo(() => {
    getChapters(slug);
  }, []);

  return (
    !!currentComic.slug && (
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
