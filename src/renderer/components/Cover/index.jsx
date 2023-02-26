import classNames from "classnames";
import "./Cover.scss";

const Cover = ({ className, children, visible, index, ...props }) => {
  return (
    <div
      className={classNames("cover", className, { visible })}
      style={index ? { zIndex: index } : {}}
    >
      {children}
    </div>
  );
};

export default Cover;
