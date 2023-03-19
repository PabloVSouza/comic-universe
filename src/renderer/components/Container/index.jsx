import classNames from "classnames";

import style from "./style.module.scss";

const Container = ({ className, children }) => {
  return (
    <div className={classNames(style.container, className)}>{children}</div>
  );
};

export default Container;
