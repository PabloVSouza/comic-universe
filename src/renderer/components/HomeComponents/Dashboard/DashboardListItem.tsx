import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { closedBookIcon, bookStackIcon } from 'assets'
import classNames from 'classnames'
import { useApi } from 'hooks'
import { useGlobalStore, usePersistSessionStore } from 'store'
import { Button } from 'components/ui'

const DashboardListItem: FC<{ item: IChapter }> = ({ item }) => {
  const { invoke } = useApi()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { activeComic } = useGlobalStore()

  const { t } = useTranslation()

  const { currentUser } = usePersistSessionStore()

  const pages = item.pages ? (JSON.parse(item.pages) as IPage[]) : ([] as IPage[])

  const disabled = !item.pages

  const totalPages = pages.length

  const chapterProgress = item.ReadProgress?.[0]

  const percentage = chapterProgress
    ? Math.round((100 / chapterProgress.totalPages) * chapterProgress.page)
    : 0

  const openChapter = async (): Promise<void> => {
    if (pages) {
      navigate(`/reader/${activeComic.id}/${item.id}`)
    }
  }

  const mutation = useMutation({
    mutationFn: async (page: number) => {
      const ReadProgress = item.ReadProgress?.[0]
      await invoke('dbUpdateReadProgress', {
        readProgress: {
          ...ReadProgress,
          chapterId: item.id,
          comicId: item.comicId,
          userId: currentUser.id,
          totalPages,
          page
        }
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['activeComicData'] })
    }
  })

  const listItem = `
    h-full flex justify-center items-center relative bg-list-item
    group-hover:bg-list-item-active group-hover:text-text-oposite
    before:content-[' '] before:absolute before:bg-list-item before:h-full before:w-full before:-z-10
  `

  return (
    <li
      className={classNames(
        `
          group h-10 w-full relative flex items-center font-semibold gap-px
          [&>div]:even:before:bg-transparent
        `,
        disabled ? 'cursor-auto' : 'cursor-pointer'
      )}
      onDoubleClick={(): Promise<void> => openChapter()}
    >
      <div className={classNames(listItem, 'w-20')}>
        <p>{item.number}</p>
      </div>
      <div className={classNames(listItem, 'grow')}>
        <p>{item.name}</p>
      </div>
      <div className={classNames(listItem, 'w-20')}>
        <p>{percentage}%</p>
      </div>
      <div className={classNames(listItem, 'aspect-square')}>
        <Button
          theme="pure"
          size="xxs"
          icon={closedBookIcon}
          title={t('Dashboard.resetProgress')}
          onClick={() => mutation.mutate(0)}
        />
      </div>
      <div className={classNames(listItem, '')}>
        <Button
          theme="pure"
          size="xxs"
          icon={bookStackIcon}
          title={t('Dashboard.setComplete')}
          onClick={() => mutation.mutate(totalPages)}
        />
      </div>
    </li>
  )
}

export default DashboardListItem
