import ComicListItem from "./Item";

import style from "./style.module.scss";

const ComicList = () => {
  return (
    <div className={style.comicList}>
      <ComicListItem />
    </div>
  );
};

export default ComicList;
