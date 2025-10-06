import { ReactElement } from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import MinimizedItem from './MinimizedItem'

interface MinimizedBarProps {
  MinimizedList: TWindow[]
}

const MinimizedBar = ({ MinimizedList }: MinimizedBarProps): ReactElement => {
  const animationSettings = {
    duration: 50,
    easing: 'ease'
  }

  const [minimizedRef] = useAutoAnimate(animationSettings)

  return (
    <div
      className="w-full absolute bottom-2 h-12 z-20 p-2 flex gap-1 overflow-x-auto"
      ref={minimizedRef}
    >
      {MinimizedList.reverse().map((win) => {
        const { title } = win.windowProps
        return <MinimizedItem key={win.id} id={win.id} title={title} />
      })}
    </div>
  )
}

export default MinimizedBar
