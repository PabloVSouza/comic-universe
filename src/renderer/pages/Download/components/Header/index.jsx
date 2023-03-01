import HtmlParser from "react-html-parser";
import Container from "components/Container";
import Image from "components/Image";

import style from "./style.module.scss";

import useComicData from "store/comic";

const DownloadChapterHeader = () => {
  const { currentComic } = useComicData((state) => state);
  return (
    <div className={style.header}>
      <Container className={style.container}>
        <div className={style.name}>
          <h1>{currentComic.name} </h1>
          <div className={style.status}>{currentComic.status}</div>
          {!!currentComic.genres && (
            <div className={style.genres}>
              {currentComic.genres.map((val) => (
                <div className={style.genre} key={val}>
                  {val}
                </div>
              ))}
            </div>
          )}
        </div>
        <Image className={style.cover} src={currentComic.cover} />
        <p className={style.description}>{HtmlParser(currentComic.synopsis)}</p>
      </Container>
    </div>
  );
};

export default DownloadChapterHeader;
