import { useNavigate } from "react-router-dom";
import classNames from "classnames";
import Image from "components/Image";

import style from "./style.module.scss";

const Button = ({
  className,
  children,
  color,
  icon,
  size,
  theme,
  to,
  ...props
}) => {
  const navigate = useNavigate();

  const classes = classNames(
    style.Button,
    style[color],
    style[theme],
    style[`size-${size}`],
    className
  );
  const handleClick = () => {
    if (to) {
      navigate(to);
    }
  };

  return (
    <button className={classes} onClick={() => handleClick()} {...props}>
      {!!icon && <Image src={icon} alt="" pure />}
      {children}
    </button>
  );
};

export default Button;
