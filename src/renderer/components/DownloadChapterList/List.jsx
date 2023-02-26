import DownloadChapterListItem from "./Item/Item";

import style from "./style.module.scss";

const DownloadChapterList = ({ list, onClick, queue }) => {
  return (
    <ul className={style.downloadChapterList}>
      {list.map((val, key) => (
        <DownloadChapterListItem
          key={key}
          data={val}
          queue={queue}
          onClick={() => !!onClick && onClick(val)}
        />
      ))}
    </ul>
  );
};

export default DownloadChapterList;
