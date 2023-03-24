import usePersistStore from 'store/usePersistStore'

import ptBR from './ptBR'
import enUS from './enUS'

const useLang = (): Lang => {
  const { lang } = usePersistStore()

  const langList = {
    ptBR,
    enUS
  }

  return new langList[lang]()
}

export default useLang
