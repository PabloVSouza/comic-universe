import { useState } from 'react'
import ComicListItem from './HomeComicListItem/HomeComicListItem'
import useDashboardStore from 'store/useDashboardStore'
import { ContextMenu, openContextMenu, TContextOptions } from 'components/ContectMenu/ContextMenu'
import deleteIcon from 'assets/trash.svg'

import style from './style.module.scss'

const HomeComicList = (): JSX.Element => {
  const { list } = useDashboardStore()

  const [currentCtxItem, setCurrentCtxItem] = useState({} as ComicInterface)

  const handleRightClick = (e: React.MouseEvent, item: ComicInterface) => {
    const position = {
      x: e.pageX - 20,
      y: e.pageY - 20
    }
    setCurrentCtxItem(item)
    openContextMenu(position)
  }
  const ctxOptions = [
    {
      title: 'Delete Comic',
      icon: deleteIcon,
      action: () => {
        console.log(currentCtxItem)
      }
    }
  ] as TContextOptions[]

  return (
    <ul className={style.comicList}>
      <ContextMenu options={ctxOptions} />
      {list.map((item) => (
        <ComicListItem
          key={item.id}
          item={item}
          onContextMenu={(e) => {
            handleRightClick(e, item)
          }}
        />
      ))}
    </ul>
  )
}

export default HomeComicList
