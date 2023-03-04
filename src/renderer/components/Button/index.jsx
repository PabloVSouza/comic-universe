import { useNavigate } from "react-router-dom";
import classNames from "classnames";
import Image from "components/Image";

import style from "./style.module.scss";

const Button = ({
  className,
  children,
  color,
  icon,
  onClick,
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
    if (onClick) onClick();
    if (to) navigate(to);
  };

  const iconStyle = {
    WebkitMaskImage: !!icon && `url(${icon})`,
  };

  return (
    <button className={classes} onClick={() => handleClick()} {...props}>
      {/* {!!icon && <Image src={icon} alt="" pure />} */}
      <div className={style.icon} style={iconStyle} />
      {children}
    </button>
  );
};

export default Button;
