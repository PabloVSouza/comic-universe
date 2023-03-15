import Window from "components/Window";
import TopBar from "./components/TopBar";
import ComicList from "./components/ComicList";
import ComicDashboard from "./components/ComicDashboard";
import RightNav from "./components/RightNav";

import style from "./style.module.scss";
import useDashboard from "store/dashboard";

const Home = () => {
  const { list, activeComic } = useDashboard((state) => state);

  return (
    <Window className={style.Home} contentClassName={style.content}>
      <TopBar />
      <RightNav />
      <div className={style.body}>
        {list.length > 0 && (
          <>
            <ComicList list={list} />
            <ComicDashboard item={activeComic} />
          </>
        )}
      </div>
    </Window>
  );
};

export default Home;
