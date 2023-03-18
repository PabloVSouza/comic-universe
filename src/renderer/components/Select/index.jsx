import Select from "react-select";
import classNames from "classnames";
import style from "./style.module.scss";

const CustomSelect = ({ className, id, ...props }) => {
  return (
    <Select
      className={classNames(style.select, className)}
      id={id}
      instanceId={id}
      unstyled
      {...props}
    />
  );
};

export default CustomSelect;
