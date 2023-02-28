import Button from "components/Button";
import lang from "lang";

import style from "./style.module.scss";

import clipboardIcon from "assets/clipboard.svg";
import downloadIcon from "assets/download-icon-2.svg";
import Container from "components/Container";
import { useComicData } from "store/comic";

const DownloadChapterNav = () => {
  const { currentComic, chapters, queue } = useComicData((state) => state);

  const { invoke } = window.electron.ipcRenderer;

  const addAllToQueue = () => {
    if (queue.length === chapters.length) {
      // dispatch({ type: "SET_DOWNLOAD_QUEUE", payload: [] });
    } else {
      const newQueue = Array.from(new Set(queue.concat(chapters)));
      // dispatch({ type: "SET_DOWNLOAD_QUEUE", payload: newQueue });
    }
  };

  const downloadQueue = async () => {
    const chapterData = await invoke(
      "downloadChapters",
      { slug: comicData.slug, ...comicData },
      queue
    );

    const dbData = {
      title: comicData.title,
      description: comicData.description,
      slug: comicData.slug,
      siteId: comicData.hash,
      cover: chapterData.coverName,
      genres: comicData.genres,
    };

    let exist = await invoke("db-update", {
      table: "Comic",
      query: {
        title: comicData.title,
      },
      data: dbData,
    });

    if (exist === 0) {
      exist = await invoke("db-insert", {
        table: "Comic",
        data: dbData,
      });
    }

    if (exist === 1) {
      exist = await invoke("db-findOne", {
        table: "Comic",
        query: { title: comicData.title },
      });
    }

    for (const chapter of chapterData.chapterFiles) {
      const chapterWriteData = {
        comic_id: exist._id,
        title: dbData.title,
        num: chapter.num,
        pages: chapter.files,
      };

      await invoke("db-insert", {
        table: "Chapter",
        data: JSON.parse(JSON.stringify(chapterWriteData)),
      });
    }

    // dispatch({ type: "GET_CHAPTERS" });

    // dispatch({ type: "SET_DOWNLOAD_QUEUE", payload: [] });
  };

  return (
    <div className={style.downloadChapterNav}>
      <Container className={style.container}>
        <div className={style.chapters}>Capítulos: {chapters.length}</div>
        <div className={style.queue}>
          {lang.DownloadComic.navigation.downloadQueue}: {queue.length}
        </div>
        <div className={style.buttons}>
          <Button
            theme="pure"
            onClick={() => addAllToQueue()}
            title={lang.DownloadComic.navigation.addToQueue}
            icon={clipboardIcon}
          />
          <Button
            theme="pure"
            onClick={() => downloadQueue()}
            title={lang.DownloadComic.navigation.downloadButton}
            icon={downloadIcon}
          />
        </div>
      </Container>
    </div>
  );
};

export default DownloadChapterNav;
