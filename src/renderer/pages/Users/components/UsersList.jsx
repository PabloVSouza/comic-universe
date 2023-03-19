import UsersListItem from "./Item";

import style from "./style.module.scss";

const UsersList = ({ list }) => {
  return (
    <div className={style.UsersList}>
      <UsersListItem newUser />
      {list.map((item) => (
        <UsersListItem key={item._id} data={item} />
      ))}
    </div>
  );
};
export default UsersList;
