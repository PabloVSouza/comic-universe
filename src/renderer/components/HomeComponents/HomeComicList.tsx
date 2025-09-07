import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import openWindow from 'functions/openWindow'
import useApi from 'api'
import { useTranslation } from 'react-i18next'
import Button from 'components/Button'
import { confirmAlert } from 'components/Alert'
import { ContextMenu, openContextMenu, TContextOptions } from 'components/ContextMenu'
import ComicListItem from 'components/HomeComponents/HomeComicListItem'
import downloadIcon from 'assets/download-icon.svg'
import deleteIcon from 'assets/trash.svg'

const HomeComicList = ({ comicList }: { comicList: IComic[] }): React.JSX.Element => {
  const { invoke } = useApi()
  const queryClient = useQueryClient()

  const { mutate: deleteComic } = useMutation({
    mutationFn: async (comic: IComic) => await invoke('dbDeleteComic', { comic }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comicList'] })
  })

  const { t } = useTranslation()

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
      title: t('Dashboard.contextMenu.deleteComic.title'),
      icon: deleteIcon,
      action: () => {
        confirmAlert({
          title: t('Dashboard.contextMenu.deleteComic.title'),
          message: t('Dashboard.contextMenu.deleteComic.confirmMessage'),
          buttons: [
            {
              label: t('Dashboard.contextMenu.deleteComic.confirmCancel')
            },
            {
              label: t('Dashboard.contextMenu.deleteComic.confirmOk'),
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
