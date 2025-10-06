import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { downloadIcon2, comicBookIcon } from 'assets'
import { useFetchData } from 'hooks'
import { usePersistSessionStore } from 'store'
import { confirmAlert, Button, ProgressBar } from 'components/ui'

const DashboardNav: FC<{
  comic: IComic
  additionalData: IComic
}> = ({ comic, additionalData }) => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { currentUser } = usePersistSessionStore()
  const { fetchNewChapters, insertChapters } = useFetchData(currentUser.id ?? '')

  const getNewChapters = async () => {
    const newChapters = await fetchNewChapters(comic)
    if (!newChapters.length) {
      confirmAlert({
        message: 'No new chapters'
      })
    } else {
      if (comic.id) {
        insertChapters({
          newChapters,
          comicId: comic.id
        })
      }
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
          icon={downloadIcon2}
          title={t('Dashboard.downloadMore')}
          onClick={getNewChapters}
        />
        <Button
          theme="pure"
          size="xxs"
          icon={comicBookIcon}
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

export default DashboardNav
