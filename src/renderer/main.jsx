import { HashRouter } from "react-router-dom";
import ReactDOM from "react-dom/client";
import Routes from "routes";
import Loading from "components/Loading";
import useGlobal from "store/global";

import style from "./style.module.scss";

const Main = ({ children }) => {
  const { theme } = useGlobal((state) => state);
  return <div className={`theme-${theme}`}>{children}</div>;
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <HashRouter>
    <Main>
      <Loading />
      <div id={style.Base}>
        <Routes />
      </div>
    </Main>
  </HashRouter>
);
