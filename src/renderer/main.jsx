import { HashRouter } from "react-router-dom";
import { Provider } from "react-redux";
import ReactDOM from "react-dom/client";
import store from "store";
import Routes from "routes";

import style from "./style.module.scss";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <HashRouter>
      <div id={style.Base}>
        <Routes />
      </div>
    </HashRouter>
  </Provider>
);
