import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import useApi from 'api'
import { trashIcon } from 'assets'
import { usePersistSessionStore } from 'store'
import { confirmAlert, ContextMenu, openContextMenu, ContextOption } from 'components/ui'
import ComicListItem from './ComicListItem'

const ComicList: FC<{ comicList: IComic[] }> = ({ comicList }) => {
  const { invoke } = useApi()
  const queryClient = useQueryClient()
  const { currentUser } = usePersistSessionStore()

  const { mutate: deleteComic } = useMutation({
    mutationFn: async (comic: IComic) => {
      // Log the deletion in database changelog
      await invoke('dbCreateChangelogEntry', {
        entry: {
          userId: currentUser.id || '',
          entityType: 'comic',
          entityId: comic.id || '',
          action: 'deleted',
          data: comic
        }
      })

      // Perform the actual deletion
      return await invoke('dbDeleteComic', { comic })
    },
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
      icon: trashIcon,
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
  ] as ContextOption[]

  return (
    <ul className="h-full w-60 overflow-auto flex flex-col gap-px z-20 bg-list">
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

export default ComicList
