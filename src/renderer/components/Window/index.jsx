import style from "./style.module.scss";
import Button from "components/Button";
import classNames from "classnames";

const Window = ({
  children,
  close,
  closebar,
  className,
  contentClassName,
  onClick,
  to,
  ...props
}) => {
  return (
    <div className={classNames(style.Window, className)} {...props}>
      {closebar && (
        <div className={style.topBar}>
          <Button theme="closeButton" onClick={onClick} to={to} />
        </div>
      )}

      {close && <Button theme="closeButton" onClick={onClick} to={to} />}

      <div className={classNames(style.content, contentClassName)}>
        {children}
      </div>
    </div>
  );
};

export default Window;
