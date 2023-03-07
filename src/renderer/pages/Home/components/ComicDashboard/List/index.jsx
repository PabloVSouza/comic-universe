import { useMemo } from "react";

import DashboardListItem from "./Item";

import useDashboard from "store/dashboard";

import style from "./style.module.scss";

const DashboardList = () => {
  const { activeComic, chapters, getChaptersDB } = useDashboard(
    (state) => state
  );

  useMemo(() => {
    getChaptersDB();
  }, [activeComic]);

  return (
    <ul className={style.DashboardList}>
      {chapters.map((item) => (
        <DashboardListItem key={item.number} item={item} />
      ))}
    </ul>
  );
};

export default DashboardList;
