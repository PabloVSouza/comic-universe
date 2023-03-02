import HtmlParser from "react-html-parser";
import Container from "components/Container";
import Image from "components/Image";
import ReactHtmlParser from "react-html-parser";

import style from "./style.module.scss";

import useComicData from "store/comic";

const DownloadChapterHeader = () => {
  const { comic } = useComicData((state) => state);
  return (
    <div className={style.header}>
      <Container className={style.container}>
        <div className={style.texts}>
          <h1 className={style.name}>{comic.name}</h1>
          {!!comic.publisher && (
            <p className={style.publisher}>{comic.publisher}</p>
          )}
          {!!comic.genres && (
            <p className={style.genre}>
              {!!comic.genres && comic.genres.join(", ")}
            </p>
          )}
          {!!comic.status && <p className={style.status}>{comic.status}</p>}
          <div className={style.synopsis}>
            {ReactHtmlParser(comic.synopsis)}
          </div>
          <p className={style.description}>{HtmlParser(comic.synopsis)}</p>
        </div>
        <Image className={style.cover} src={comic.cover} />
      </Container>
    </div>
  );
};

export default DownloadChapterHeader;
