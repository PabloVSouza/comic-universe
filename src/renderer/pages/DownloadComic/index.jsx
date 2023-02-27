import { useMemo } from "react";
import { useParams } from "react-router-dom";
import merge from "lodash.merge";

import Window from "components/Window";
import DownloadChapterHeader from "./components/DownloadChapterHeader";
import DownloadChapterList from "./components/DownloadChapterList";
import DownloadChapterNav from "./components/DownloadChapterNav";

import style from "./style.module.scss";

const DownloadComic = () => {
  const { slug } = useParams();

  useMemo(async () => {
    // dispatch(getComicData());
  }, []);

  // const comicData = useSelector((state) => state.currentComic);

  // console.log(comicData, slug);

  return (
    !!comicData?.allposts && (
      <Window
        closebar
        to={"/"}
        className={style.downloadComic}
        contentClassName={style.content}
      >
        <DownloadChapterHeader comicData={comicData} />
        <DownloadChapterNav />

        <DownloadChapterList />
      </Window>
    )
  );
};

export default DownloadComic;
