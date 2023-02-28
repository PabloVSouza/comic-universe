import { useComicData } from "store/comic";
import DownloadChapterListItem from "./Item";

import style from "./style.module.scss";

const DownloadChapterList = () => {
  const { chapters } = useComicData((state) => state);

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
