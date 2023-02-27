import { HashRouter } from "react-router-dom";
import ReactDOM from "react-dom/client";
import Routes from "routes";
import Loading from "components/Loading";

import style from "./style.module.scss";

ReactDOM.createRoot(document.getElementById("root")).render(
  <HashRouter>
    <Loading />
    <div id={style.Base}>
      <Routes />
    </div>
  </HashRouter>
);
