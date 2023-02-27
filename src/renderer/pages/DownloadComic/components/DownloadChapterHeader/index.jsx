import Container from "components/Container";
import Image from "components/Image";

import style from "./style.module.scss";

const DownloadChapterHeader = ({ comicData }) => {
  return (
    <div className={style.header}>
      <Container className={style.container}>
        <div className={style.title}>
          <h1>{comicData.chapter_name}</h1>
          <div className={style.chapter}>
            {comicData.genres.map((val) => (
              <div key={val}>{val}</div>
            ))}
          </div>
        </div>
        <Image className={style.cover} src={comicData.cover} />
        <p className={style.description}>{comicData.description}</p>
      </Container>
    </div>
  );
};

export default DownloadChapterHeader;
