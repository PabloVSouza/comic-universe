import { useNavigate } from 'react-router-dom'
import classNames from 'classnames'
import useLang from 'lang'
import Button from 'components/Button/Button'
import useDashboardStore from 'store/useDashboardStore'

import closedBook from 'assets/closed-book-icon.svg'
import bookStack from 'assets/book-stack.svg'
import useReaderStore from 'store/useReaderStore'
import usePersistStore from 'store/usePersistStore'

const HomeDashboardComicListItem = ({ item }: { item: ChapterInterface }): JSX.Element => {
  const navigate = useNavigate()

  const texts = useLang()

  const { comic, setComic } = useDashboardStore()
  const { setReadProgressDB } = useReaderStore()
  const { currentUser } = usePersistStore()

  const pages = item.pages ? (JSON.parse(item.pages) as Page[]) : ([] as Page[])

  const disabled = !item.pages

  const totalPages = pages.length

  const chapterProgress = item.ReadProgress[0]

  const percentage = chapterProgress
    ? Math.round((100 / chapterProgress.totalPages) * chapterProgress.page)
    : 0

  const openChapter = async (): Promise<void> => {
    if (pages) {
      navigate(`/reader/${comic.id}/${item.id}`)
    }
  }

  const handleReadProgress = async (page: number): Promise<void> => {
    const ReadProgress = item.ReadProgress[0]

    await setReadProgressDB({
      ...ReadProgress,
      chapterId: item.id,
      comicId: comic.id,
      userId: currentUser.id,
      totalPages,
      page
    })

    await setComic(comic.id)
  }

  const listItem = `
    h-full flex justify-center items-center relative bg-list-item
    group-hover:bg-list-item-active group-hover:text-text-oposite
    before:content-[' '] before:absolute before:bg-list-item before:h-full before:w-full before:-z-10
  `

  return (
    <li
      className={classNames(
        `
          group h-10 w-full shrink-0 relative flex items-center font-semibold gap-px
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
          icon={closedBook}
          title={texts.Dashboard.resetProgress}
          onClick={(): Promise<void> => handleReadProgress(0)}
        />
      </div>
      <div className={classNames(listItem, '')}>
        <Button
          theme="pure"
          size="xxs"
          icon={bookStack}
          title={texts.Dashboard.setComplete}
          onClick={(): Promise<void> => handleReadProgress(totalPages)}
        />
      </div>
    </li>
  )
}

export default HomeDashboardComicListItem
