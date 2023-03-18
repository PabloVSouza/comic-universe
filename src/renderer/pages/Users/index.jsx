import Window from "components/Window";
import UsersList from "./components/UsersList";

import useLang from "lang";

import style from "./style.module.scss";

const Users = () => {
  const lang = useLang();
  const list = [
    { _id: 1, name: "Pablo" },
    { _id: 2, name: "Teste1" },
    { _id: 3, name: "Teste2" },
    { _id: 4, name: "Teste3" },
    { _id: 5, name: "Teste4" },
    { _id: 6, name: "Teste5" },
  ];

  return (
    <Window className={style.Users} contentClassName={style.Content}>
      <h1>{lang.Users.header}</h1>
      <UsersList list={list} />
    </Window>
  );
};

export default Users;
