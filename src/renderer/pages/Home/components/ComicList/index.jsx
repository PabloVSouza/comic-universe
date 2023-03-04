import ComicListItem from "./Item";

import style from "./style.module.scss";

const ComicList = ({ list }) => {
  return (
    <ul className={style.comicList}>
      {list.map((item) => (
        <ComicListItem key={item.id} item={item} />
      ))}
    </ul>
  );
};

export default ComicList;
