import { usePersistedData } from "store/global";

import ptBR from "./ptBR";
import enUS from "./enUS";

const useLang = () => {
  const { lang } = usePersistedData((state) => state);

  const langList = {
    ptBR,
    enUS,
  };

  return langList[lang];
};

export default useLang;
