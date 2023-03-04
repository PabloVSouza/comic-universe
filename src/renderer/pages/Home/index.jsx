import Window from "components/Window";
import TopMenu from "./components/TopMenu";
import ComicList from "./components/ComicList";
import ComicDashboard from "./components/ComicDashboard";

import style from "./style.module.scss";
import useComicData from "store/comic";
import useReader from "store/reader";

const Home = () => {
  const { resetComic } = useComicData((state) => state);
  const { getList, list } = useReader((state) => state);

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
