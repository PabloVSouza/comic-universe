import Button from "components/Button";

import style from "./style.module.scss";

import downloadIcon from "assets/download-icon.svg";
import userProfileIcon from "assets/user-profile.svg";

const TopMenu = () => {
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
        />
      </div>
    </div>
  );
};

export default TopMenu;
