import Window from "components/Window";
import TopMenu from "./components/TopMenu";
import ComicList from "./components/ComicList";
import ComicDashboard from "./components/ComicDashboard";

import style from "./style.module.scss";
import useDashboard from "store/dashboard";

const Home = () => {
  const { list } = useDashboard((state) => state);

  return (
    <Window className={style.Home} contentClassName={style.content}>
      <TopMenu />
      <div className={style.body}>
        <ComicList list={list} />
        <ComicDashboard />
      </div>
    </Window>
  );
};

export default Home;
