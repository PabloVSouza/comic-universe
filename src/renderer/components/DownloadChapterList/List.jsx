import DownloadChapterListItem from "./Item/Item";

import style from "./style.module.scss";

const DownloadChapterList = () => {
  const comicData = {};
  const chapters = comicData.allposts;

  return (
    <div className={style.downloadChapterList}>
      <ul>
        {chapters.map((val, key) => (
          <DownloadChapterListItem key={key} data={val} />
        ))}
      </ul>
    </div>
  );
};

export default DownloadChapterList;
