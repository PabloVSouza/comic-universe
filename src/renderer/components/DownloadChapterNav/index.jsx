import lang from "lang";

import Button from "components/Button";
import style from "./style.module.scss";

import clipboardIcon from "assets/clipboard.svg";
import downloadIcon from "assets/download-icon-2.svg";
import Container from "components/Container";

const DownloadChapterNav = ({ chapters = [], queue = [] }) => {
  const addAllToQueue = () => {};
  const downloadQueue = () => {};

  return (
    <div className={style.downloadChapterNav}>
      <Container className={style.container}>
        <div className={style.chapters}>Capítulos: {chapters.length}</div>
        <div className={style.queue}>
          {lang.DownloadManga.navigation.downloadQueue}: {queue.length}
        </div>
        <div className={style.buttons}>
          <Button
            theme="pure"
            onClick={() => addAllToQueue()}
            title={lang.DownloadManga.navigation.addToQueue}
            icon={clipboardIcon}
          />
          <Button
            theme="pure"
            onClick={() => downloadQueue()}
            title={lang.DownloadManga.navigation.downloadQueue}
            icon={downloadIcon}
          />
        </div>
      </Container>
    </div>
  );
};

export default DownloadChapterNav;
