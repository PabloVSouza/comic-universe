import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import lang from "lang";

import Window from "components/Window";
import Image from "components/Image";

import style from "./style.module.scss";
import DownloadChapterHeader from "components/DownloadChapterHeader";
import DownloadChapterList from "components/DownloadChapterList/list";

const DownloadManga = () => {
  const { slug } = useParams();

  const [mangaData, setMangaData] = useState(null);
  const [downloadQueue, setDownloadQueue] = useState([]);

  const handleClick = (data) => {
    const found = downloadQueue.findIndex((val) => val.num === data.num);
    if (found < 0) {
      setDownloadQueue((downloadQueue) => [...downloadQueue, data]);
    } else {
      setDownloadQueue(downloadQueue.filter((val) => val.num !== data.num));
    }
  };

  useMemo(() => {
    window.electron.ipcRenderer.invoke("getMangaData", slug).then((res) => {
      setMangaData(res);
    });
  }, []);

  return (
    !!mangaData && (
      <Window
        closebar
        to={"/"}
        className={style.downloadManga}
        contentClassName={style.content}
      >
        <DownloadChapterHeader mangaData={mangaData} />

        <div className={style.chapters}>
          <h1>{lang.DownloadManga.chaptersTitle}</h1>
          <DownloadChapterList
            list={mangaData.allposts}
            onClick={handleClick}
            queue={downloadQueue}
          />
        </div>
      </Window>
    )
  );
};

export default DownloadManga;
