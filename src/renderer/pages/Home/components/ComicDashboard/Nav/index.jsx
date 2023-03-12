import { useNavigate } from "react-router-dom";

import Button from "components/Button";

import lang from "lang";
import useDashboard from "store/dashboard";

import style from "./style.module.scss";

import downloadIcon from "assets/download-icon-2.svg";
import comicBook from "assets/comic-book.svg";

const DashboardNav = () => {
  const navigate = useNavigate();

  const { activeComic, chapters, readProgress } = useDashboard(
    (state) => state
  );

  const calcTotalProgress = () => {
    let totalRead = 0;
    let totalPages = 0;

    for (const chapter of chapters) {
      const chapterProgress = readProgress.find(
        (val) => val.chapterId === chapter._id
      );
      totalRead += chapterProgress ? chapterProgress.page : 0;
      totalPages += chapter.pages.length - 1;
    }
    const totalProgress = Math.round((100 / totalPages) * totalRead);

    return Number.isNaN(totalProgress) ? 0 : totalProgress;
  };

  const totalPercent = calcTotalProgress();

  const continueReading = () => {
    let lastRead = chapters[0];

    for (const chapter of chapters) {
      const progress = readProgress.find(
        (val) => val.chapterId === chapter._id
      );

      if (progress && progress.page > 0) lastRead = chapter;
    }

    navigate(`reader/${activeComic._id}/${lastRead.number}`);
  };

  return (
    <div className={style.DashboardNav}>
      <div className={style.buttons}>
        <Button
          theme="pure"
          size="xxs"
          icon={downloadIcon}
          to={`download/${activeComic.id}`}
        />
        <Button
          theme="pure"
          size="xxs"
          icon={comicBook}
          onClick={() => continueReading()}
        />
      </div>
      <div className={style.progressBar}>
        <p>
          {totalPercent}% {lang.Dashboard.read}
        </p>
        <div style={{ width: `${totalPercent}%` }} />
      </div>
    </div>
  );
};

export default DashboardNav;
