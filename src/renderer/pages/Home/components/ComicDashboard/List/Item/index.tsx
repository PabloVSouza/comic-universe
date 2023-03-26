import { useNavigate } from 'react-router-dom'
import classNames from 'classnames'

import useLang from 'lang'

import Button from 'components/Button'

import useDashboardStore from 'store/useDashboardStore'

import style from './style.module.scss'

import closedBook from 'assets/closed-book-icon.svg'
import bookStack from 'assets/book-stack.svg'

const DashboardListItem = ({ item }: { item: Chapter }): JSX.Element => {
  const navigate = useNavigate()

  const texts = useLang()

  const { comic, readProgress, getReadProgressDB, setReadProgress } = useDashboardStore()

  const totalPages = item.pages.length - 1

  const chapterProgress = readProgress.find((val) => val.chapterId === item._id)

  const percentage = chapterProgress
    ? Math.round((100 / chapterProgress.totalPages) * chapterProgress.page)
    : 0

  const openChapter = (): void => {
    navigate(`/reader/${comic._id}/${item._id}`)
  }

  const handleReadProgress = async (page: number): Promise<void> => {
    await setReadProgress(item, page)
    getReadProgressDB()
  }

  return (
    <li className={style.DashboardListItem} onDoubleClick={(): void => openChapter()}>
      <div className={classNames(style.listItem, style.number)}>
        <p>{item.number}</p>
      </div>
      <div className={classNames(style.listItem, style.name)}>
        <p>{item.name}</p>
      </div>
      <div className={classNames(style.listItem, style.percentage)}>
        <p>{percentage}%</p>
      </div>
      <div className={classNames(style.listItem, style.button)}>
        <Button
          theme="pure"
          size="xxs"
          icon={closedBook}
          title={texts.Dashboard.resetProgress}
          onClick={(): Promise<void> => handleReadProgress(0)}
        />
      </div>
      <div className={classNames(style.listItem, style.button)}>
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

export default DashboardListItem
