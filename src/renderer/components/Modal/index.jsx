import Cover from "components/Cover";
import Search from "./Search";

import style from "./style.module.scss";

const Modal = ({ modal, ...props }) => {
  const components = {
    Search,
  };

  return (
    !!components[modal] && (
      <Cover visible index="2" className={style.modal}>
        {components[modal]({ ...props })}
      </Cover>
    )
  );
};

export default Modal;
