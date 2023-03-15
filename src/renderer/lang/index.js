import useGlobal from "store/global";

import ptBR from "./ptBR";
import enUS from "./enUS";

const { lang } = useGlobal.getState();

const langList = { ptBR, enUS };

export default langList[lang];
