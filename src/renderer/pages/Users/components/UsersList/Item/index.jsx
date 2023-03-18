import classNames from "classnames";

import Image from "components/Image";

import style from "./style.module.scss";

import plusIcon from "assets/plus.svg";
import userIcon from "assets/user.svg";

const UsersListItem = ({ data, newUser }) => {
  if (newUser)
    return (
      <div className={classNames(style.UsersListItem, style.newUser)}>
        <Image className={style.background} svg src={plusIcon} />
      </div>
    );

  return (
    <div className={style.UsersListItem}>
      <Image className={style.background} svg src={userIcon} />
      <p className={style.name}>{data.name}</p>
    </div>
  );
};
export default UsersListItem;
