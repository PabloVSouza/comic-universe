import Window from 'components/Window'
import style from './style.module.scss'

const ModalMessage = ({ text, ...props }: { text: string }): JSX.Element => {
  return (
    <Window close to={'/'} className={style.Message} contentClassName={style.content} {...props}>
      <h1>{text}</h1>
    </Window>
  )
}

export default ModalMessage
