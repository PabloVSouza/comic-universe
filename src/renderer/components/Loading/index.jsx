import Cover from "components/Cover";
import Image from "components/Image";

import { useLoading } from "store/loading";

import style from "./style.module.scss";

import imgLoading from "assets/loading.svg";

const Loading = () => {
  const state = useLoading((state) => state);
  const { status, message, progress } = state;

  const totalProgress = Math.round((100 / progress.total) * progress.current);
  return (
    <Cover visible={status} index="999">
      {message !== "" ? (
        <div className={style.message}>
          <h1>Downloading Chapter {message}</h1>
          <Image pure src={imgLoading} alt="" />
          <div className={style.progressBar}>
            <p>{totalProgress}%</p>
            <div
              className={style.bar}
              style={{ width: `${totalProgress}%` }}
            ></div>
          </div>
        </div>
      ) : (
        <Image pure src={imgLoading} alt="" />
      )}
    </Cover>
  );
};

export default Loading;
