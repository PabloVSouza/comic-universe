import Cover from "components/Cover";
import ModalSearch from "./Search";
import ModalAbout from "./About";

import style from "./style.module.scss";

const useModal = ({ modal }) => {
  if (modal === "search") return ModalSearch;
  if (modal === "about") return ModalAbout;
  return null;
};

const Modal = ({ modal, ...props }) => {
  const ModalComponent = useModal({ modal });

  return (
    !!ModalComponent && (
      <Cover visible index="2" className={style.modal}>
        {<ModalComponent {...props} />}
      </Cover>
    )
  );
};

export default Modal;
