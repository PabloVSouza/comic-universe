import MangaListItem from "./Item/Item";

import style from "./style.module.scss";

const MangaList = () => {
  return (
    <div className={style.mangaList}>
      <MangaListItem />
    </div>
  );
};

export default MangaList;
