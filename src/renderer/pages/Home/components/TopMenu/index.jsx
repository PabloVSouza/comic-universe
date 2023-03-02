import Button from "components/Button";

import style from "./style.module.scss";

import downloadIcon from "assets/download-icon.svg";
import userProfileIcon from "assets/user-profile.svg";
import useGlobal from "store/global";

const TopMenu = () => {
  const { switchTheme } = useGlobal((state) => state);

  return (
    <div className={style.topMenu}>
      <div className={style.groupLeft}>
        <Button
          className={style.button}
          icon={downloadIcon}
          size="xs"
          theme="pure"
          to="/search"
        />
      </div>
      <div className={style.groupRight}>
        <Button
          className={style.button}
          icon={userProfileIcon}
          size="xs"
          theme="pure"
          onClick={() => switchTheme()}
        />
      </div>
    </div>
  );
};

export default TopMenu;
