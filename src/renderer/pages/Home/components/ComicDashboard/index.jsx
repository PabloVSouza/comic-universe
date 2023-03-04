import DashboardHeader from "./Header";
import DashboardNav from "./Nav";
import DashboardList from "./List";

import style from "./style.module.scss";

const ComicDashboard = ({ item }) => {
  return (
    <div className={style.comicDashboard}>
      <DashboardHeader />
      <DashboardNav />
      <DashboardList />
    </div>
  );
};

export default ComicDashboard;
