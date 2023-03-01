import useComicData from "store/comic";
import classNames from "classnames";

import style from "./style.module.scss";

const DownloadChapterListItem = ({ data }) => {
  const { queue } = useComicData((state) => state);
  // const dispatch = useDispatch();

  // const downloadedChapters = useSelector((state) => state.downloadedChapters);
  // const downloaded = !!downloadedChapters.find((e) => e.num == data.num);
  const active = !!queue.find((e) => e.num == data.num);

  const addToQueue = () => {
    // if (!downloaded) {
    //   const found = queue.findIndex((val) => val.num === data.num);
    //   if (found < 0) {
    //     dispatch({ type: "SET_DOWNLOAD_QUEUE", payload: [...queue, data] });
    //   }
    //   if (found >= 0) {
    //     dispatch({
    //       type: "SET_DOWNLOAD_QUEUE",
    //       payload: queue.filter((val) => val.num !== data.num),
    //     });
    //   }
    // }
  };

  return (
    <li
      className={classNames(
        style.downloadChapterListItem,
        active ? style.active : null
        // downloaded ? style.downloaded : null
      )}
      onClick={() => addToQueue(data)}
    >
      <p>{data.num}</p>
      <span>{data.chapters[0].date}</span>
    </li>
  );
};

export default DownloadChapterListItem;
