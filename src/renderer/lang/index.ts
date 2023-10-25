import usePersistStore from 'store/usePersistStore'

import ptBR from './ptBR'
import enUS from './enUS'

const useLang = (): Lang => {
  const { lang } = usePersistStore.getState()

  const langList = {
    ptBR,
    enUS
  }

  return new langList['enUS']()
}

export default useLang
