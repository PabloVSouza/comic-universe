import classNames from "classnames";
import style from "./style.module.scss";

const Cover = ({ className, children, visible, index, ...props }) => {
  return (
    <div
      className={classNames(
        style.cover,
        className,
        visible ? style.visible : null
      )}
      style={index ? { zIndex: index } : {}}
    >
      {children}
    </div>
  );
};

export default Cover;
