import classNames from "classnames";

import style from "./style.module.scss";

const DownloadChapterListItem = ({ data, onClick, queue }) => {
  const active = !!queue.find((e) => e.num == data.num);
  return (
    <li
      className={classNames(
        style.downloadChapterListItem,
        active ? style.active : null
      )}
      onClick={() => !!onClick && onClick()}
    >
      <p>{data.num}</p>
      <span>{data.chapters[0].date}</span>
    </li>
  );
};

export default DownloadChapterListItem;
