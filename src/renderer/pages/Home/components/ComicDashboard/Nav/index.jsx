import lang from "lang";

import useDashboard from "store/dashboard";

import style from "./style.module.scss";

const DashboardNav = () => {
  const { chapters, readProgress } = useDashboard((state) => state);

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

  return (
    <div className={style.DashboardNav}>
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
