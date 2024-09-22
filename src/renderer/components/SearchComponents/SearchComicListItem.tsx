import { LiHTMLAttributes } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useApi from 'api'
import LoadingOverlay from 'components/LoadingOverlay'
import { useNavigate } from 'react-router-dom'
import ReactHtmlParser from 'react-html-parser'
import classNames from 'classnames'

import usePersistStore from 'store/usePersistStore'

import useLang from 'lang'

import loading from 'assets/loading.svg'
import Image from 'components/Image'
import Button from 'components/Button'

interface IComicListItem extends LiHTMLAttributes<unknown> {
  data: IComic
  activeComic: IComic
  setActiveComic: (comic: IComic) => void
}

const SearchComicListItem = ({
  data,
  activeComic,
  setActiveComic
}: IComicListItem): JSX.Element => {
  const texts = useLang()
  const { invoke } = useApi()
  const queryClient = useQueryClient()
  const { repo } = usePersistStore()

  const navigate = useNavigate()

  const active = String(activeComic.siteId) === String(data.siteId)

  const { data: comicList, isFetching: comicListFetching } = useQuery({
    queryKey: ['comicList'],
    queryFn: async () => (await invoke('dbGetAllComics')) as IComic[],
    initialData: []
  })

  const { data: comicDetails, isFetching: comicDetailsFetching } = useQuery({
    queryKey: [`comicDetails-${repo.value}-${data.siteId}`],
    queryFn: async () => {
      const search = { siteId: data.siteId, siteLink: data.siteLink ?? '' }

      return await invoke('getDetails', {
        repo: repo.value,
        data: search
      })
    },
    enabled: !data.cover || !data.synopsis
  })

  const { data: chapterData, isFetching: chapterDataFetching } = useQuery({
    queryKey: [`chapterData-${repo.value}-${data.siteId}`],
    queryFn: async () =>
      (await invoke('getChapters', {
        repo: repo.value,
        data: { siteId: data.siteId }
      })) as IChapter[],
    initialData: [],
    enabled: active && !data.chapters
  })

  const { mutate: insertComic } = useMutation({
    mutationFn: async () =>
      await invoke('dbInsertComic', {
        comic: { ...data, ...comicDetails },
        chapters: chapterData,
        repo: repo.value
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comicList'] })
  })

  const isLoading = comicListFetching || chapterDataFetching || comicDetailsFetching

  const extended = active && chapterData.length > 0

  const comicData = { ...data, ...comicDetails }

  const existsInDB = !!comicList.find((comic) => String(comic.siteId) === String(data.siteId))

  const setActive = async (): Promise<void> => {
    setActiveComic(comicData)
  }

  const addToList = (): void => {
    insertComic()
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
                {chapterData.length} {texts.SearchComic.availableChapters}
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
                  {existsInDB
                    ? texts.SearchComic.alreadyBookmarked
                    : texts.SearchComic.bookmarkComic}
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
          placeholderSrc={loading}
        />
      </div>
    </li>
  )
}

export default SearchComicListItem
