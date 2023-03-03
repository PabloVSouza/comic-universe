import Container from "components/Container";
import Image from "components/Image";
import ReactHtmlParser from "react-html-parser";
import slugify from "slugify";

import style from "./style.module.scss";

import useComicData from "store/comic";
import useGlobal from "store/global";

const DownloadChapterHeader = () => {
  const { comic } = useComicData((state) => state);
  const { appPath } = useGlobal((state) => state);

  const cover = !comic._id
    ? comic.cover
    : `file:///${encodeURI(
        path.join(
          appPath,
          "downloads",
          comic.type,
          slugify(comic.name),
          comic.cover
        )
      )}`;

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
          <p className={style.description}>{ReactHtmlParser(comic.synopsis)}</p>
        </div>
        <Image className={style.cover} src={cover} />
      </Container>
    </div>
  );
};

export default DownloadChapterHeader;
