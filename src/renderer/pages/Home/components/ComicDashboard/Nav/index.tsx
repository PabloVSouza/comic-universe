import { useNavigate } from 'react-router-dom'

import Button from 'components/Button'

import useLang from 'lang'

import useDashboardStore from 'store/useDashboardStore'

import style from './style.module.scss'

import downloadIcon from 'assets/download-icon-2.svg'
import comicBook from 'assets/comic-book.svg'

const DashboardNav = (): JSX.Element => {
  const navigate = useNavigate()

  const texts = useLang()

  const { comic, getNewChapters } = useDashboardStore()

  const { chapters } = comic

  const totalPages = chapters.reduce((prev, cur) => {
    return cur.pages ? prev + (JSON.parse(cur.pages).length - 1) : prev
  }, 0)

  const totalRead = chapters.reduce((prev, cur) => {
    return cur.ReadProgress.length ? prev + cur.ReadProgress[0].page : prev
  }, 0)

  const totalProgress = Math.round((100 / totalPages) * totalRead)

  const continueReading = (): void => {
    const lastRead = chapters.reduce((prev, cur) => {
      return cur.ReadProgress.length && cur.ReadProgress[0].page > 0 ? cur : prev
    }, chapters[0])

    navigate(`reader/${comic.id}/${lastRead.id}`)
  }

  return (
    <div className={style.DashboardNav}>
      <div className={style.buttons}>
        <Button
          theme="pure"
          size="xxs"
          icon={downloadIcon}
          title={texts.Dashboard.downloadMore}
          onClick={getNewChapters}
        />
        <Button
          theme="pure"
          size="xxs"
          icon={comicBook}
          title={texts.Dashboard.continueReading}
          onClick={continueReading}
        />
      </div>
      <div className={style.progressBar}>
        <p>
          {totalProgress}% {texts.Dashboard.read}
        </p>
        <div style={{ width: `${totalProgress}%` }} />
      </div>
    </div>
  )
}

export default DashboardNav
