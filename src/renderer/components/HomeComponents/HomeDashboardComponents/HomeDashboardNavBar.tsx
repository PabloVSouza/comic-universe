import { useNavigate } from 'react-router-dom'
import Button from 'components/Button'
import { useTranslation } from 'react-i18next'
import useFetchData from 'hooks/useFetchData'

import downloadIcon from 'assets/download-icon-2.svg'
import comicBook from 'assets/comic-book.svg'
import ProgressBar from 'components/ProgressBar'
import { confirmAlert } from 'components/Alert'

const HomeDashboardNavBar = ({
  comic,
  additionalData
}: {
  comic: IComic
  additionalData: IComic
}): React.JSX.Element => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { fetchNewChapters, insertChapters } = useFetchData()

  const getNewChapters = async () => {
    const newChapters = await fetchNewChapters(comic)
    if (!newChapters.length) {
      confirmAlert({
        message: 'No new chapters'
      })
    } else {
      insertChapters({
        newChapters,
        comicId: comic.id
      })
    }
  }

  const chapters = additionalData?.chapters ?? []

  const totalPages = chapters.reduce((prev, cur) => {
    return cur.pages ? prev + JSON.parse(cur.pages).length : prev
  }, 0)

  const totalRead = chapters.reduce((prev, cur) => {
    return cur.ReadProgress?.length ? prev + cur.ReadProgress[0].page : prev
  }, 0)

  const continueReading = (): void => {
    const lastRead = chapters.reduce((prev, cur) => {
      return cur.ReadProgress?.length && cur.ReadProgress[0].page > 0 ? cur : prev
    }, chapters[0])

    navigate(`reader/${comic.id}/${lastRead.id}`)
  }

  return (
    <div className="h-12 shrink-0 bg-default relative flex">
      <div className="z-20 w-full h-full flex items-center justify-between px-2">
        <Button
          theme="pure"
          size="xxs"
          icon={downloadIcon}
          title={t('Dashboard.downloadMore')}
          onClick={getNewChapters}
        />
        <Button
          theme="pure"
          size="xxs"
          icon={comicBook}
          title={t('Dashboard.continueReading')}
          onClick={continueReading}
        />
      </div>
      <ProgressBar
        total={totalPages}
        current={totalRead}
        className="!absolute h-full w-full"
        showPercentage
      />
    </div>
  )
}

export default HomeDashboardNavBar
