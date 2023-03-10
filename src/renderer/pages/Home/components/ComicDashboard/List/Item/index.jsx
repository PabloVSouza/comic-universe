import { useNavigate } from "react-router-dom";
import classNames from "classnames";

import lang from "lang";

import Button from "components/Button";

import useDashboard from "store/dashboard";

import style from "./style.module.scss";

import closedBook from "assets/closed-book-icon.svg";
import bookStack from "assets/book-stack.svg";

const DashboardListItem = ({ item }) => {
  const navigate = useNavigate();

  const { activeComic, readProgress, getReadProgressDB, changeReadProgress } =
    useDashboard((state) => state);

  const totalPages = item.pages.length - 1;

  const chapterProgress = readProgress.find(
    (val) => val.chapterId === item._id
  );

  const percentage = chapterProgress
    ? Math.round((100 / chapterProgress.totalPages) * chapterProgress.page)
    : 0;

  const openChapter = () => {
    navigate(`/reader/${activeComic._id}/${item.number}`);
  };

  const handleReadProgress = async (page) => {
    await changeReadProgress(item, page);
    getReadProgressDB();
  };

  return (
    <li className={style.DashboardListItem} onDoubleClick={() => openChapter()}>
      <div className={classNames(style.listItem, style.number)}>
        <p>{item.number}</p>
      </div>
      <div className={classNames(style.listItem, style.name)}>
        <p>{item.name}</p>
      </div>
      <div className={classNames(style.listItem, style.percentage)}>
        <p>{percentage}%</p>
      </div>
      <div className={classNames(style.listItem, style.button)}>
        <Button
          theme="pure"
          size="xxs"
          icon={closedBook}
          title={lang.Dashboard.resetProgress}
          onClick={() => handleReadProgress(0)}
        />
      </div>
      <div className={classNames(style.listItem, style.button)}>
        <Button
          theme="pure"
          size="xxs"
          icon={bookStack}
          title={lang.Dashboard.setComplete}
          onClick={() => handleReadProgress(totalPages)}
        />
      </div>
    </li>
  );
};

export default DashboardListItem;
