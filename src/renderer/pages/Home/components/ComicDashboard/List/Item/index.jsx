import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import classNames from "classnames";

import Button from "components/Button";

import useDashboard from "store/dashboard";

import style from "./style.module.scss";

import closedBook from "assets/closed-book-icon.svg";
import bookStack from "assets/book-stack.svg";

const DashboardListItem = ({ item }) => {
  const navigate = useNavigate();

  const { activeComic, getReadProgress } = useDashboard((state) => state);
  const [readProgress, setReadProgress] = useState(null);

  useMemo(() => {
    getReadProgress(item._id).then((res) => {
      setReadProgress(res);
    });
  }, []);

  const percentage = readProgress
    ? Math.round((100 / readProgress.totalPages) * readProgress.page)
    : 0;

  const openChapter = () => {
    navigate(`/reader/${activeComic._id}/${item.number}`);
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
        <Button theme={"pure"} size="xxs" icon={closedBook} />
      </div>
      <div className={classNames(style.listItem, style.button)}>
        <Button theme={"pure"} size="xxs" icon={bookStack} />
      </div>
    </li>
  );
};

export default DashboardListItem;
