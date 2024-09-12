import { useState, useMemo, useEffect, useRef, MutableRefObject } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import useApi from 'api'
import debounce from 'lodash.debounce'
import { SingleValue } from 'react-select'
import Select from 'components/Select'
import Image from 'components/Image'
import SearchComicList from 'components/SearchComponents/SearchComicList'
import Loading from 'components/LoadingOverlay'
import Pagination from 'components/Pagination'
import useLang from 'lang'
import usePersistStore from 'store/usePersistStore'

import searchIcon from 'assets/magnifying-glass-search.svg'

const Search = (): JSX.Element => {
  const { invoke } = useApi()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [offset, setOffset] = useState(0)
  const { repo, setRepo } = usePersistStore()
  const inputRef = useRef(null) as MutableRefObject<null> | MutableRefObject<HTMLInputElement>

  const {
    data: list,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['searchList', search, repo],
    queryFn: async () => await invoke('search', { repo: repo.value, data: { search } }),
    initialData: []
  })

  const { data: repoList } = useQuery({
    queryKey: ['repoList'],
    queryFn: async () => (await invoke('getRepoList')) as TOption[],
    initialData: []
  })

  // useEffect(() => {
  //   if (!(repo in repoList)) {
  //     if (repoList[0]) setRepo(repoList[0])
  //   }
  // }, [repoList])

  const noRepos = !repoList.length

  const texts = useLang()

  type TOption = SingleValue<{
    value: string
    label: string
  }>

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
      <div className="w-full h-24 flex-shrink-0 py-6 px-11 absolute top-0 bg-modal backdrop-blur-sm shadow-basic">
        <div className="h-full w-full bg-default shadow-basic rounded flex justify-center items-center pr-4 max-w-3xl my-0 mx-auto">
          <Select
            defaultValue={repo}
            options={repoList}
            onChange={(e) => handleChangeRepo(e as TOption)}
            isDisabled={noRepos}
          />
          <input
            className="flex-grow bg-transparent text-lg placeholder:text-text-default placeholder:opacity-60 pl-5"
            placeholder={texts.SearchComic.textPlaceholder}
            type="text"
            onChange={debouncedResults}
            ref={inputRef}
          />
          <Image
            src={searchIcon}
            svg
            className="h-full aspect-square bg-text-default p-2 opacity-60"
          />
        </div>
      </div>
      <SearchComicList list={list} offset={offset} className="pt-24 pb-14" />
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

const windowSettings = {
  windowProps: {
    contentClassName: 'h-full w-full flex flex-col overflow-hidden items-center relative',
    closeable: true,
    titleBar: true,
    unique: true,
    title: useLang().SearchComic.windowTitle
  },
  initialStatus: {
    startPosition: 'center',
    width: '90%',
    height: '90%'
  }
} as TWindow

export default { Search, ...windowSettings }
