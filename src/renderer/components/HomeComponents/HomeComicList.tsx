import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { confirmAlert } from 'react-confirm-alert'
import useApi from 'api'
import { ContextMenu, openContextMenu, TContextOptions } from 'components/ContextMenu'
import ComicListItem from 'components/HomeComponents/HomeComicListItem'
import useLang from 'lang'
import LoadingOverlay from 'components/LoadingOverlay'
import useDashboardStore from 'store/useDashboardStore'

import deleteIcon from 'assets/trash.svg'

const { invoke } = useApi()

const HomeComicList = (): JSX.Element => {
  const { data, isLoading } = useQuery({
    queryKey: ['comicList'],
    queryFn: async () => (await invoke('dbGetAllComics')) as ComicInterface[],
    initialData: []
  })

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
    <ul className="h-full w-60 overflow-auto flex flex-col gap-px z-20 mt-px bg-list">
      <LoadingOverlay isLoading={isLoading} />
      <ContextMenu options={ctxOptions} />
      {data.map((item) => (
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
