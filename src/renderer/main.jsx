import { HashRouter } from "react-router-dom";
import ReactDOM from "react-dom/client";
import Routes from "routes";
import Loading from "components/Loading";
import { usePersistedData } from "store/global";

import style from "scss/main/style.module.scss";
import themes from "scss/main/themes.module.scss";

import classNames from "classnames";

const Main = ({ children }) => {
  const { theme } = usePersistedData((state) => state);
  return (
    <div className={classNames(themes[theme], style.main)}>{children}</div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <HashRouter>
    <Main>
      <Loading />
      <Routes />
    </Main>
  </HashRouter>
);
