import { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

import Window from "components/Window";
import DownloadChapterHeader from "components/DownloadChapterHeader";
import DownloadChapterList from "components/DownloadChapterList/list";
import DownloadChapterNav from "components/DownloadChapterNav";

import style from "./style.module.scss";

const DownloadManga = () => {
  const dispatch = useDispatch();
  const { slug } = useParams();

  useMemo(() => {
    window.electron.ipcRenderer.invoke("getMangaData", slug).then((res) => {
      dispatch({ type: "SET_CURRENT_COMIC", payload: res });
    });
  }, []);

  const mangaData = useSelector((state) => state.currentComic);

  return (
    !!mangaData && (
      <Window
        closebar
        to={"/"}
        className={style.downloadManga}
        contentClassName={style.content}
      >
        <DownloadChapterHeader mangaData={mangaData} />
        <DownloadChapterNav />

        <DownloadChapterList />
      </Window>
    )
  );
};

export default DownloadManga;
