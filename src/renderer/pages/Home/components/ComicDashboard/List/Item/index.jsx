import style from "./style.module.scss";

const DashboardListItem = ({ item }) => {
  return <li className={style.DashboardListItem}>{item.number}</li>;
};

export default DashboardListItem;
