import ComicListItem from './HomeComicListItem/HomeComicListItem'
import useDashboardStore from 'store/useDashboardStore'
import { ContextMenu, openContextMenu, TContextOptions } from 'components/ContectMenu/ContextMenu'
import deleteIcon from 'assets/trash.svg'

import style from './style.module.scss'

const HomeComicList = (): JSX.Element => {
  const { list } = useDashboardStore()

  const handleRightClick = (e: React.MouseEvent) => {
    const position = {
      x: e.pageX - 20,
      y: e.pageY - 20
    }
    openContextMenu(position)
  }
  const ctxOptions = [
    {
      title: 'Delete Comic',
      icon: deleteIcon,
      action: () => {
        console.log('Oi')
      }
    },
    {
      title: 'Delete Comic1',
      icon: deleteIcon,
      action: () => {
        console.log('Oi1')
      }
    }
  ] as TContextOptions[]

  return (
    <ul className={style.comicList}>
      <ContextMenu options={ctxOptions} />
      {list.map((item) => (
        <ComicListItem key={item.id} item={item} onContextMenu={handleRightClick} />
      ))}
    </ul>
  )
}

export default HomeComicList
