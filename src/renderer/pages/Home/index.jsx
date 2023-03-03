import Window from "components/Window";
import TopMenu from "./components/TopMenu";
import ComicList from "./components/ComicList";
import ComicDashboard from "./components/ComicDashboard";

import style from "./style.module.scss";
import useComicData from "store/comic";
import { useMemo } from "react";

const Home = () => {
  const { resetComic } = useComicData((state) => state);

  useMemo(() => {
    // resetComic();
  }, []);

  return (
    <Window className={style.Home}>
      <TopMenu />
      <ComicList />
      <ComicDashboard />
    </Window>
  );
};

export default Home;
