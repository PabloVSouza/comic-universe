import Button from "components/Button";
import useLang from "lang";
import style from "./style.module.scss";

import clipboardIcon from "assets/clipboard.svg";
import downloadIcon from "assets/download-icon-2.svg";
import Container from "components/Container";
import useComicData from "store/comic";
import useDashboard from "store/dashboard";

const DownloadChapterNav = () => {
  const texts = useLang();

  const { downloadChapter, chapters, queue, setQueue, downloadedChapters } =
    useComicData((state) => state);
  const { getListDB } = useDashboard((state) => state);

  const addAllToQueue = () => {
    if (queue.length + downloadedChapters.length === chapters.length) {
      setQueue([]);
    } else {
      const filteredChapters = chapters.filter((val) => {
        if (!downloadedChapters.find((item) => item.id === val.id)) {
          return val;
        }
      });

      const newQueue = Array.from(new Set(queue.concat(filteredChapters)));
      setQueue(newQueue);
    }
  };

  const downloadQueue = async () => {
    for (const item of queue) {
      await downloadChapter(item);
    }
    setQueue([]);
    getListDB();
  };

  return (
    <div className={style.downloadChapterNav}>
      <Container className={style.container}>
        <div className={style.chapters}>Capítulos: {chapters.length}</div>
        <div className={style.queue}>
          {texts.DownloadComic.navigation.downloadQueue}: {queue.length}
        </div>
        <div className={style.buttons}>
          <Button
            theme="pure"
            onClick={() => addAllToQueue()}
            title={texts.DownloadComic.navigation.addToQueue}
            icon={clipboardIcon}
          />
          <Button
            theme="pure"
            onClick={() => downloadQueue()}
            title={texts.DownloadComic.navigation.downloadButton}
            icon={downloadIcon}
          />
        </div>
      </Container>
    </div>
  );
};

export default DownloadChapterNav;
