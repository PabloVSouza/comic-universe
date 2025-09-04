import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import openWindow from 'functions/openWindow'
import useApi from 'api'
import useLang from 'lang'
import Button from 'components/Button'
import { confirmAlert } from 'components/Alert'
import { ContextMenu, openContextMenu, TContextOptions } from 'components/ContextMenu'
import ComicListItem from 'components/HomeComponents/HomeComicListItem'
import downloadIcon from 'assets/download-icon.svg'
import deleteIcon from 'assets/trash.svg'

const { invoke } = useApi()

const HomeComicList = ({ comicList }: { comicList: IComic[] }): JSX.Element => {
  const queryClient = useQueryClient()

  const { mutate: deleteComic } = useMutation({
    mutationFn: async (comic: IComic) => await invoke('dbDeleteComic', { comic }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comicList'] })
  })

  const lang = useLang()

  const [currentCtxItem, setCurrentCtxItem] = useState({} as IComic)

  const handleRightClick = (e: React.MouseEvent, item: IComic) => {
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
          title: lang.Dashboard.contextMenu.deleteComic.title,
          message: lang.Dashboard.contextMenu.deleteComic.confirmMessage,
          buttons: [
            {
              label: lang.Dashboard.contextMenu.deleteComic.confirmCancel
            },
            {
              label: lang.Dashboard.contextMenu.deleteComic.confirmOk,
              action: () => {
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
      <li className="flex justify-center items-center">
        <Button
          className="z-30 h-full"
          icon={downloadIcon}
          size="xs"
          theme="pure"
          onClick={() => openWindow({ component: 'Search', props: {} })}
        />
      </li>
      <ContextMenu options={ctxOptions} />
      {comicList.map((item) => (
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
