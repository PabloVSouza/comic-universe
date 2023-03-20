import Cover from 'components/Cover'
import ModalSearch from './Search'
import ModalAbout from './About'
import ModalSettings from './Settings'

import style from './style.module.scss'

interface Modal {
  modal?: string
}

const useModal = ({ modal }: Modal): (() => JSX.Element) => {
  if (modal === 'search') return ModalSearch
  if (modal === 'about') return ModalAbout
  if (modal === 'settings') return ModalSettings
  const Empty = (): JSX.Element => <></>
  return Empty
}

const Modal = ({ modal, ...props }: Modal): JSX.Element => {
  const ModalComponent = useModal({ modal })
  return (
    <Cover visible index="2" className={style.modal}>
      {<ModalComponent {...props} />}
    </Cover>
  )
}

export default Modal
