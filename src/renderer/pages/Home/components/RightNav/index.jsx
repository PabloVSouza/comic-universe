import { useNavigate } from "react-router-dom";

import classNames from "classnames";

import Cover from "components/Cover";

import useLang from "lang";

import useGlobal from "store/global";

import style from "./style.module.scss";

import infoIcon from "assets/info.svg";
import settingsIcon from "assets/settings.svg";
import darkmodeIcon from "assets/darkmode.svg";
import userIcon from "assets/user.svg";

const RightNav = () => {
  const { menuVisible, switchTheme, toggleMenu } = useGlobal((state) => state);
  const navigate = useNavigate();
  const texts = useLang();

  const options = [
    {
      label: texts.RightNav.about,
      icon: infoIcon,
      onClick: () => navigate("/?modal=about"),
    },
    {
      label: texts.RightNav.settings,
      icon: settingsIcon,
    },
    {
      label: texts.RightNav.darkMode,
      icon: darkmodeIcon,
      onClick: () => switchTheme(),
    },
    {
      label: texts.RightNav.changeUser,
      icon: userIcon,
    },
  ];

  const handleClick = (onClick) => {
    toggleMenu();
    onClick();
  };

  return (
    <Cover
      visible={menuVisible}
      className={classNames(style.RightNav, menuVisible ? style.visible : null)}
    >
      <ul>
        {options.map((option) => (
          <li onClick={() => handleClick(option.onClick)} key={option.label}>
            <div
              className={style.icon}
              style={{ WebkitMaskImage: `url(${option.icon})` }}
            />
            <p>{option.label}</p>
          </li>
        ))}
      </ul>
    </Cover>
  );
};

export default RightNav;
