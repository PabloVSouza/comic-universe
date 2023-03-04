import slugify from "slugify";
import Image from "components/Image";

import useGlobal from "store/global";

import style from "./style.module.scss";

const ComicListItem = ({ item }) => {
  const { appPath } = useGlobal((state) => state);
  const cover = `file:///${encodeURI(
    path.join(appPath, "downloads", item.type, slugify(item.name), item.cover)
  )}`;

  return (
    <li className={style.comicListItem}>
      <p className={style.name}>{item.name}</p>
      <Image className={style.cover} src={cover} />
    </li>
  );
};

export default ComicListItem;
