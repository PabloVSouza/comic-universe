import Window from "components/Window";
import TopMenu from "components/TopMenu";
import MangaList from "components/ComicList/List";
import MangaDashboard from "components/ComicDashboard/ComicDashboard";

import style from "./style.module.scss";

const Home = () => {
  return (
    <Window className={style.Home}>
      <TopMenu />
      <MangaList />
      <MangaDashboard />
    </Window>
  );
};

export default Home;
