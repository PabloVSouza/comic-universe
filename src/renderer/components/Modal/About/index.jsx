import Window from "components/Window";
import Image from "components/Image";

import style from "./style.module.scss";

import appIcon from "assets/icon.png";

const ModalAbout = () => {
  const { app } = window;
  console.log(app);
  return (
    <Window
      close
      to={"/"}
      className={style.About}
      contentClassName={style.content}
    >
      <Image src={appIcon} className={style.icon} />
      <div className={style.texts}>
        <h1>Comic Universe</h1>
        <p>Ver: {app.version}</p>
        <p>Author: {app.author}</p>
        <p>License: {app.license}</p>
        {app.description.split(". ").map((description) => (
          <p>{description}.</p>
        ))}
        <a href={app.repository} target="_blank">
          <u>Github Repository</u>
        </a>
      </div>
    </Window>
  );
};

export default ModalAbout;
