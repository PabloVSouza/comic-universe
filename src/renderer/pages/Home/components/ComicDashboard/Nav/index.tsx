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

  const { comic, chapters, readProgress } = useDashboardStore()

  const calcTotalProgress = (): number => {
    let totalRead = 0
    let totalPages = 0

    for (const chapter of chapters) {
      const chapterProgress = readProgress.find((val) => val.chapterId === chapter._id)
      totalRead += chapterProgress ? chapterProgress.page ?? 0 : 0
      totalPages += chapter.pages?.length - 1 ?? 0
    }
    const totalProgress = Math.round((100 / totalPages) * totalRead)

    return Number.isNaN(totalProgress) ? 0 : totalProgress
  }

  const totalPercent = calcTotalProgress()

  const continueReading = (): void => {
    let lastRead = chapters[0]

    for (const chapter of chapters) {
      const progress = readProgress.find((val) => val.chapterId === chapter._id)

      if (progress && progress.page > 0) lastRead = chapter
    }

    navigate(`reader/${comic._id}/${lastRead._id}`)
  }

  return (
    <div className={style.DashboardNav}>
      <div className={style.buttons}>
        <Button
          theme="pure"
          size="xxs"
          icon={downloadIcon}
          title={texts.Dashboard.downloadMore}
          to={`download/${comic.siteId}`}
        />
        <Button
          theme="pure"
          size="xxs"
          icon={comicBook}
          title={texts.Dashboard.continueReading}
          onClick={(): void => continueReading()}
        />
      </div>
      <div className={style.progressBar}>
        <p>
          {totalPercent}% {texts.Dashboard.read}
        </p>
        <div style={{ width: `${totalPercent}%` }} />
      </div>
    </div>
  )
}

export default DashboardNav
