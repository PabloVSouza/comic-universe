import { useState } from 'react'
import { confirmAlert } from 'react-confirm-alert'
import ComicListItem from '../HomeComicListItem/HomeComicListItem'
import useDashboardStore from 'store/useDashboardStore'
import { ContextMenu, openContextMenu, TContextOptions } from 'components/ContextMenu/ContextMenu'
import useLang from 'lang'

import deleteIcon from 'assets/trash.svg'

import style from './HomeComicList.module.scss'

const HomeComicList = (): JSX.Element => {
  const { list } = useDashboardStore()
  const lang = useLang()

  const [currentCtxItem, setCurrentCtxItem] = useState({} as ComicInterface)
  const { deleteComic } = useDashboardStore()

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
      title: lang.Dashboard.contextMenu.deleteComic.title,
      icon: deleteIcon,
      action: () => {
        confirmAlert({
          message: lang.Dashboard.contextMenu.deleteComic.confirmMessage,
          buttons: [
            {
              label: lang.Dashboard.contextMenu.deleteComic.confirmCancel
            },
            {
              label: lang.Dashboard.contextMenu.deleteComic.confirmOk,
              onClick: () => {
                deleteComic(currentCtxItem)
              }
            }
          ]
        })
      }
    }
  ] as TContextOptions[]

  return (
    <ul className={style.HomeComicList}>
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
