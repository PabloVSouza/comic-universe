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
  const { menuVisible, switchTheme, changeLanguage, lang } = useGlobal(
    (state) => state
  );

  const texts = useLang();

  const options = [
    {
      label: texts.RightNav.about,
      icon: infoIcon,
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
      label: "Change Language",
      onClick: () => changeLanguage(),
    },
    {
      label: texts.RightNav.changeUser,
      icon: userIcon,
    },
  ];

  return (
    <Cover
      visible={menuVisible}
      className={classNames(style.RightNav, menuVisible ? style.visible : null)}
    >
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
