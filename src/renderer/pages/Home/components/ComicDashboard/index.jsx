import DashboardHeader from "./Header";
import DashboardNav from "./Nav";
import DashboardList from "./List";

import useDashboard from "store/dashboard";

import style from "./style.module.scss";

const ComicDashboard = ({ item }) => {
  const { list } = useDashboard((state) => state);

  return (
    <div className={style.comicDashboard}>
      {!!item._id && (
        <>
          <DashboardHeader item={item} />
          <DashboardNav />
          <DashboardList list={list} />
        </>
      )}
    </div>
  );
};

export default ComicDashboard;
