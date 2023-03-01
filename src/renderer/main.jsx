import { HashRouter } from "react-router-dom";
import ReactDOM from "react-dom/client";
import Routes from "routes";
import Loading from "components/Loading";
import useGlobal from "store/global";

import style from "./style.module.scss";

const { theme } = useGlobal.getState();

ReactDOM.createRoot(document.getElementById("root")).render(
  <HashRouter>
    <div className={`theme-${theme}`}>
      <Loading />
      <div id={style.Base}>
        <Routes />
      </div>
    </div>
  </HashRouter>
);
