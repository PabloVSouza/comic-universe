import Image from "components/Image";
import style from "./style.module.scss";

const DownloadChapterHeader = ({ mangaData }) => {
  return (
    <div className={style.header}>
      <div className={style.container}>
        <div className={style.title}>
          <h1>{mangaData.chapter_name}</h1>
          <div className={style.chapter}>
            {mangaData.genres.map((val) => (
              <div key={val}>{val}</div>
            ))}
          </div>
        </div>
        <Image className={style.cover} src={mangaData.cover} />
        <p className={style.description}>{mangaData.description}</p>
      </div>
    </div>
  );
};

export default DownloadChapterHeader;
