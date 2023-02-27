import Window from "components/Window";
import TopMenu from "./components/TopMenu";
import ComicList from "./components/ComicList";
import ComicDashboard from "./components/ComicDashboard";

import style from "./style.module.scss";

const Home = () => {
  return (
    <Window className={style.Home}>
      <TopMenu />
      <ComicList />
      <ComicDashboard />
    </Window>
  );
};

export default Home;
