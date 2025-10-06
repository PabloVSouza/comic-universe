import { FC, LiHTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import useApi from 'api'
import { loadingIcon } from 'assets'
import classNames from 'classnames'
import ReactHtmlParser from 'html-react-parser'
import { Button } from 'components/ui'
import { Image } from 'components/ui'
import { LoadingOverlay } from 'components/ui'
import useFetchData from 'hooks/useFetchData'
import usePersistSessionStore from 'store/usePersistSessionStore'
import usePersistStore from 'store/usePersistStore'

interface SearchComicListItemProps extends LiHTMLAttributes<unknown> {
  data: IComic
  activeComic: IComic
  setActiveComic: (comic: IComic) => void
}

const SearchComicListItem: FC<SearchComicListItemProps> = ({
  data,
  activeComic,
  setActiveComic
}) => {
  const { t } = useTranslation()
  const { invoke } = useApi()
  const { repo } = usePersistStore()
  const { currentUser } = usePersistSessionStore()
  const { insertComic } = useFetchData(currentUser.id ?? '')

  const navigate = useNavigate()

  const active = String(activeComic.siteId) === String(data.siteId)

  const { data: comicList, isFetching: comicListFetching } = useQuery({
    queryKey: ['comicList', currentUser.id],
    queryFn: async () => (await invoke('dbGetAllComics', { userId: currentUser.id })) as IComic[],
    initialData: [],
    enabled: !!currentUser.id
  })

  const { data: comicDetails, isFetching: comicDetailsFetching } = useQuery({
    queryKey: [`comicDetails-${repo.repo.value}-${data.siteId}`],
    queryFn: async () => {
      const search = { siteId: data.siteId, siteLink: data.siteLink ?? '' }

      return await invoke('getDetails', {
        repo: repo.repo.value,
        data: search
      })
    },
    enabled: !data.cover || !data.synopsis
  })

  const { data: chapterData, isFetching: chapterDataFetching } = useQuery({
    queryKey: [`chapterData-${repo.repo.value}-${data.siteId}`],
    queryFn: async () =>
      (await invoke('getChapters', {
        repo: repo.repo.value,
        data: { siteId: data.siteId }
      })) as IChapter[],
    initialData: [],
    enabled: active && !data.chapters
  })

  const isLoading = comicListFetching || chapterDataFetching || comicDetailsFetching

  const extended = active && chapterData.length > 0

  const comicData = { ...data, ...comicDetails }

  const existsInDB = !!comicList.find((comic) => String(comic.siteId) === String(data.siteId))

  const setActive = async (): Promise<void> => {
    setActiveComic(comicData)
  }

  const addToList = (): void => {
    insertComic({ data, comicDetails, chapterData, repo: repo.repo.value })
    navigate('/')
  }

  return (
    <li
      className={classNames(
        'bg-list-item flex flex-col transition-all duration-500 ease-default relative',
        extended
          ? 'h-96 hover:bg-list-item hover:text-text-default cursor-default'
          : 'h-48 hover:bg-list-item-hover hover:text-text-oposite cursor-pointer'
      )}
      onClick={setActive}
    >
      <LoadingOverlay isLoading={isLoading} />
      <div className="flex h-full">
        <div className="flex-grow flex flex-col justify-center items-center p-3">
          <h1 className="text-2xl text-center">{ReactHtmlParser(comicData.name)}</h1>
          {!!comicData.publisher && <p className="text-xs">{comicData.publisher}</p>}
          {!!comicData.author && <p className="text-xs">{comicData.author}</p>}
          {!!comicData.genres && (
            <p className="text-sm">
              {!!comicData.genres && JSON.parse(comicData.genres).join(', ')}
            </p>
          )}
          {!!comicData.status && <p>{comicData.status}</p>}
          {extended && (
            <>
              <p className="mt-2">
                {chapterData.length} {t('SearchComic.availableChapters')}
              </p>
              <div className="flex-grow h-px flex justify-center items-center my-2">
                <p className="overflow-auto max-h-full">{ReactHtmlParser(comicData.synopsis)}</p>
              </div>
              <div className="flex-shrink-0">
                <Button
                  size="xl"
                  color={existsInDB ? 'white' : 'green'}
                  onClick={addToList}
                  disabled={existsInDB}
                >
                  {existsInDB ? t('SearchComic.alreadyBookmarked') : t('SearchComic.bookmarkComic')}
                </Button>
              </div>
            </>
          )}
        </div>
        <Image
          className="h-auto aspect-10/16"
          placeholderClassName="h-full px-3 aspect-10/16"
          src={comicData.cover}
          lazy
          placeholderSrc={loadingIcon}
        />
      </div>
    </li>
  )
}

export default SearchComicListItem
