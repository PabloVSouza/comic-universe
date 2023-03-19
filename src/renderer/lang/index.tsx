import usePersist from 'store/persist'

import ptBR from './ptBR'
import enUS from './enUS'

const useLang = (): Lang => {
  const { lang } = usePersist()

  const langList = {
    ptBR,
    enUS
  }

  return new langList[lang]()
}

export default useLang
