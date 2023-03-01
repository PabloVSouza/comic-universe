import HtmlParser from "react-html-parser";
import Container from "components/Container";
import Image from "components/Image";

import style from "./style.module.scss";

import useComicData from "store/comic";

const DownloadChapterHeader = () => {
  const { comic } = useComicData((state) => state);
  return (
    <div className={style.header}>
      <Container className={style.container}>
        <div className={style.name}>
          <h1>{comic.name} </h1>
          <div className={style.status}>{comic.status}</div>
          {!!comic.genres && (
            <div className={style.genres}>
              {comic.genres.map((val) => (
                <div className={style.genre} key={val}>
                  {val}
                </div>
              ))}
            </div>
          )}
        </div>
        <Image className={style.cover} src={comic.cover} />
        <p className={style.description}>{HtmlParser(comic.synopsis)}</p>
      </Container>
    </div>
  );
};

export default DownloadChapterHeader;
