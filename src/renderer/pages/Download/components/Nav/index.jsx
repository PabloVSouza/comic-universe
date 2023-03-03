import Button from "components/Button";
import lang from "lang";

import style from "./style.module.scss";

import clipboardIcon from "assets/clipboard.svg";
import downloadIcon from "assets/download-icon-2.svg";
import Container from "components/Container";
import useComicData from "store/comic";

const DownloadChapterNav = () => {
  const { downloadChapter, chapters, queue, setQueue } = useComicData(
    (state) => state
  );

  const addAllToQueue = () => {
    if (queue.length === chapters.length) {
      setQueue([]);
    } else {
      const newQueue = Array.from(new Set(queue.concat(chapters)));
      setQueue(newQueue);
    }
  };

  const downloadQueue = async () => {
    for (const item of queue) {
      await downloadChapter(item);
    }
    setQueue([]);
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
