import { useNavigate } from "react-router-dom";

import useDashboard from "store/dashboard";

import style from "./style.module.scss";

const DashboardListItem = ({ item }) => {
  const navigate = useNavigate();

  const { activeComic } = useDashboard((state) => state);

  const openChapter = () => {
    navigate(`/reader/${activeComic._id}/${item.number}`);
  };

  return (
    <li className={style.DashboardListItem} onDoubleClick={() => openChapter()}>
      {item.number}
    </li>
  );
};

export default DashboardListItem;
