import { FC, useState, useMemo, useEffect, useRef, MutableRefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { magnifyingGlassSearchIcon } from 'assets'
import { useApi } from 'hooks'
import debounce from 'lodash.debounce'
import { usePersistStore } from 'store'
import { ComicList } from 'components/SearchComponents'
import { Image, LoadingOverlay as Loading, Pagination, Select } from 'components/UiComponents'

type TOption = {
  value: string
  label: string
}

const Search: FC = () => {
  const { invoke } = useApi()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [offset, setOffset] = useState(0)
  const { repo, setRepo } = usePersistStore()
  const inputRef = useRef(null) as MutableRefObject<null> | MutableRefObject<HTMLInputElement>

  const [noRepos, setNoRepos] = useState(true)

  const { data: repoList } = useQuery({
    queryKey: ['repoList'],
    queryFn: async () => {
      const repos = await invoke<TOption[]>('getRepoList')
      if (repos.length) {
        if (!repo.repo.value || !repos.includes(repo.repo)) setRepo(repos[0])
        setNoRepos(false)
      }
      return repos
    },
    initialData: []
  })

  const {
    data: list,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['searchList', search, repo],
    queryFn: async () => {
      return search.length > 0
        ? await invoke<IComic[]>('search', { repo: repo.repo.value, data: { search } })
        : await invoke<IComic[]>('getList', { repo: repo.repo.value })
    },
    initialData: [],
    enabled: !!repoList.length
  })

  const { t } = useTranslation()

  const handleChangeRepo = (e: TOption): void => {
    if (inputRef.current) inputRef.current.value = ''
    if (e) setRepo(e)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearch(e.target.value)
    refetch()
  }

  const debouncedResults = useMemo(() => {
    return debounce(handleSearch, 1500)
  }, [])

  useEffect(() => {
    return () => {
      debouncedResults.cancel()
      queryClient.invalidateQueries({ queryKey: ['repoList'] })
    }
  }, [])

  useMemo(() => {
    if (!noRepos && !!repo) {
      if (search.length) refetch()
    }
  }, [search])

  return (
    <>
      <Loading isLoading={isFetching} />
      <div className="w-full h-24 flex-shrink-0 py-6 px-11 absolute top-0 bg-modal backdrop-blur-sm shadow-basic z-10">
        <div className="h-full w-full bg-default shadow-basic rounded flex justify-center items-center pr-4 max-w-3xl my-0 mx-auto">
          <Select
            value={noRepos ? { label: t('SearchComic.noReposAvailable') } : repo.repo}
            options={repoList}
            onChange={(e) => handleChangeRepo(e as TOption)}
            isDisabled={noRepos}
          />
          <input
            className="flex-grow bg-transparent text-lg placeholder:text-text-default placeholder:opacity-60 pl-5"
            placeholder={t('SearchComic.textPlaceholder')}
            type="text"
            onChange={debouncedResults}
            ref={inputRef}
          />
          <Image
            src={magnifyingGlassSearchIcon}
            svg
            className="h-full aspect-square bg-text-default p-2 opacity-60"
          />
        </div>
      </div>
      <ComicList list={list} offset={offset} className="pt-24 pb-14" />
      <div className="w-full flex items-center justify-center shadow-basic absolute bottom-0 h-14 bg-modal backdrop-blur-sm">
        <Pagination
          setOffset={setOffset}
          list={list}
          itemsPerPage={10}
          className="!w-3/4 max-w-3xl"
        />
      </div>
    </>
  )
}

const getWindowSettings = () => {
  return {
    windowProps: {
      contentClassName: 'h-full w-full flex flex-col overflow-hidden items-center relative',
      closeable: true,
      titleBar: true,
      unique: true,
      title: 'Search' // Will be translated dynamically in openWindow
    },
    initialStatus: {
      startPosition: 'center',
      width: '90%',
      height: '90%'
    }
  } as TWindow
}

export default { Search, ...getWindowSettings() }
