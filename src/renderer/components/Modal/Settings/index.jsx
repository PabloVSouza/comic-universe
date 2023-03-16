import style from "./style.module.scss";
import Window from "components/Window";

const ModalSettings = () => {
  return <Window close to={"/"} className={style.Settings}></Window>;
};

export default ModalSettings;
