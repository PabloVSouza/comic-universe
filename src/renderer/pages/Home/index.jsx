import Window from "components/Window";
import TopBar from "./components/TopBar";
import ComicList from "./components/ComicList";
import ComicDashboard from "./components/ComicDashboard";

import style from "./style.module.scss";
import useDashboard from "store/dashboard";

const Home = () => {
  const { list, activeComic } = useDashboard((state) => state);

  return (
    <Window className={style.Home} contentClassName={style.content}>
      <TopBar />
      {list.length > 0 && (
        <div className={style.body}>
          <ComicList list={list} />
          <ComicDashboard item={activeComic} />
        </div>
      )}
    </Window>
  );
};

export default Home;
