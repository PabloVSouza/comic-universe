import { useSearchParams } from 'react-router-dom'

import Cover from 'components/Cover/Cover'
import ModalSearch from './Search'
import ModalAbout from './About'
import ModalSettings from './Settings'
import ModalMessage from './Message/Index'

import style from './style.module.scss'

interface Modal {
  modal?: string
}

const useModal = ({ modal }: Modal): (() => JSX.Element) | null => {
  if (modal === 'search') return ModalSearch
  if (modal === 'about') return ModalAbout
  if (modal === 'settings') return ModalSettings
  //@ts-ignore Fix later
  if (modal === 'message') return ModalMessage
  return null
}

const Modal = ({ modal, ...props }: Modal): JSX.Element => {
  const [searchParams] = useSearchParams()
  const modalProps = { ...Object.fromEntries([...searchParams]) }

  const ModalComponent = useModal({ modal })
  return ModalComponent ? (
    <Cover visible index="2" className={style.modal}>
      {<ModalComponent {...modalProps} {...props} />}
    </Cover>
  ) : (
    <></>
  )
}

export default Modal
