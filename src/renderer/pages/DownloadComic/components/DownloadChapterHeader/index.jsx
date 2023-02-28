import HtmlParser from "react-html-parser";
import Container from "components/Container";
import Image from "components/Image";

import style from "./style.module.scss";

import { useComicData } from "store/comic";

const DownloadChapterHeader = () => {
  const { currentComic } = useComicData((state) => state);
  const genres = currentComic.genre.split(", ");
  return (
    <div className={style.header}>
      <Container className={style.container}>
        <div className={style.title}>
          <h1>{currentComic.title}</h1>
          <div className={style.genres}>
            {genres.map((val) => (
              <div key={val}>{val}</div>
            ))}
          </div>
        </div>
        <Image className={style.cover} src={currentComic.cover} />
        <p className={style.description}>{HtmlParser(currentComic.synopsis)}</p>
      </Container>
    </div>
  );
};

export default DownloadChapterHeader;
