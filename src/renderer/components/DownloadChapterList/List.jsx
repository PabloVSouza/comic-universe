import { useSelector } from "react-redux";

import DownloadChapterListItem from "./Item/Item";

import style from "./style.module.scss";

const DownloadChapterList = () => {
  const mangaData = useSelector((state) => state.currentComic);
  const chapters = mangaData.allposts;

  return (
    <ul className={style.downloadChapterList}>
      {chapters.map((val, key) => (
        <DownloadChapterListItem key={key} data={val} />
      ))}
    </ul>
  );
};

export default DownloadChapterList;
