import Cover from "components/Cover";

import useGlobal from "store/global";

import style from "./style.module.scss";

import infoIcon from "assets/info.svg";
import settingsIcon from "assets/settings.svg";
import darkmodeIcon from "assets/darkmode.svg";
import userIcon from "assets/user.svg";

const RightNav = () => {
  const { menuVisible, switchTheme } = useGlobal((state) => state);

  const options = [
    {
      label: "About this App",
      icon: infoIcon,
    },
    {
      label: "Settings",
      icon: settingsIcon,
    },
    {
      label: "Dark Mode",
      icon: darkmodeIcon,
      onClick: () => switchTheme(),
    },
    {
      label: "Change User",
      icon: userIcon,
    },
  ];

  return (
    <Cover visible={menuVisible} className={style.RightNav}>
      <ul>
        {options.map((option) => (
          <li onClick={option.onClick} key={option.label}>
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
