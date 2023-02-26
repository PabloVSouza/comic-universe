import { useSelector, useDispatch } from "react-redux";

import classNames from "classnames";

import style from "./style.module.scss";

const DownloadChapterListItem = ({ data }) => {
  const dispatch = useDispatch();

  const queue = useSelector((state) => state.downloadQueue);
  const active = !!queue.find((e) => e.num == data.num);

  const addToQueue = () => {
    const found = queue.findIndex((val) => val.num === data.num);

    if (found < 0) {
      dispatch({ type: "SET_DOWNLOAD_QUEUE", payload: [...queue, data] });
    }

    if (found >= 0) {
      dispatch({
        type: "SET_DOWNLOAD_QUEUE",
        payload: queue.filter((val) => val.num !== data.num),
      });
    }
  };

  return (
    <li
      className={classNames(
        style.downloadChapterListItem,
        active ? style.active : null
      )}
      onClick={() => addToQueue(data)}
    >
      <p>{data.num}</p>
      <span>{data.chapters[0].date}</span>
    </li>
  );
};

export default DownloadChapterListItem;
