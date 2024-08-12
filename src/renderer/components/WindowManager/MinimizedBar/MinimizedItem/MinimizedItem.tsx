import { ReactElement } from 'react'
import style from './MinimizeItem.module.scss'
import useWindowManagerStore from 'store/useWindowManagerStore'

const MinimizedItem = ({ title, id }: Partial<TWindowProps>): ReactElement => {
  const { setIsMinimized, removeWindow } = useWindowManagerStore()

  if (id)
    return (
      <div
        className={style.MinimizeItem}
        onClick={(): void => setIsMinimized(id, false)}
        onContextMenu={(): void => removeWindow(id)}
      >
        <p>{title}</p>
      </div>
    )

  return <></>
}

export default MinimizedItem
