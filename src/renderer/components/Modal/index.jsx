import Cover from "components/Cover";
import Window from "components/Window";

import style from "./style.module.scss";

const Modal = ({ modal, ...props }) => {
  const components = {};

  return (
    !!components[modal] && (
      <div className={style.modal}>
        <Cover visible index="2" />
        <Window className="window">{components[modal]({ ...props })}</Window>
      </div>
    )
  );
};

export default Modal;
