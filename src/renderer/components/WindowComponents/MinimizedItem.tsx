import { ReactElement } from 'react'
import { useWindowManagerStore } from 'store'

const MinimizedItem = ({ title, id }: Partial<TWindowProps>): ReactElement => {
  const { setIsMinimized, removeWindow } = useWindowManagerStore()

  if (id)
    return (
      <div
        className="max-w-72 min-w-24 h-full bg-modal flex items-center justify-center px-2 cursor-pointer shadow-basic rounded hover:bg-oposite hover:text-text-oposite"
        onClick={(): void => setIsMinimized(id, false)}
        onContextMenu={(): void => removeWindow(id)}
      >
        <p className="whitespace-nowrap text-ellipsis overflow-hidden">{title}</p>
      </div>
    )

  return <></>
}

export default MinimizedItem
