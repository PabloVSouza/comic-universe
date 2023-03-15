import { useSearchParams } from "react-router-dom";

import Window from "components/Window";
import TopBar from "./components/TopBar";
import ComicList from "./components/ComicList";
import ComicDashboard from "./components/ComicDashboard";
import RightNav from "./components/RightNav";

import style from "./style.module.scss";
import useDashboard from "store/dashboard";
import Modal from "components/Modal";

const Home = () => {
  const { list, activeComic } = useDashboard((state) => state);
  const [searchParams] = useSearchParams();

  const { modal } = Object.fromEntries([...searchParams]);
  const modalParams = {
    ...Object.fromEntries([...searchParams]),
  };

  return (
    <>
      {!!modal && <Modal {...modalParams} />}
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
    </>
  );
};

export default Home;
