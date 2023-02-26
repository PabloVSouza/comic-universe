import Container from "components/Container";
import Image from "components/Image";

import style from "./style.module.scss";

const DownloadChapterHeader = ({ mangaData }) => {
  return (
    <div className={style.header}>
      <Container className={style.container}>
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
      </Container>
    </div>
  );
};

export default DownloadChapterHeader;
