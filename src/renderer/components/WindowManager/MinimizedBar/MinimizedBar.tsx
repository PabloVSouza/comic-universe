import { ReactElement } from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import MinimizedItem from './MinimizedItem'
import style from './MinimizeBar.module.scss'

type TMinimizeBarProps = {
  MinimizedList: TWindow[]
}

const MinimizedBar = ({ MinimizedList }: TMinimizeBarProps): ReactElement => {
  const animationSettings = {
    duration: 50,
    easing: 'ease'
  }

  const [minimizedRef] = useAutoAnimate(animationSettings)

  return (
    <div className={style.MinimizedBar} ref={minimizedRef}>
      {MinimizedList.reverse().map((win) => {
        const { title } = win.windowProps
        return <MinimizedItem key={win.id} id={win.id} title={title} />
      })}
    </div>
  )
}

export default MinimizedBar
