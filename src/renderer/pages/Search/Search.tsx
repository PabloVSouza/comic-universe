import { useState, useMemo, useEffect, useRef, MutableRefObject } from 'react'
import debounce from 'lodash.debounce'
import SearchComicList from 'components/SearchComponents/SearchComicList/SearchComicList'
import Select from 'components/Select'
import useSearchStore from 'store/useSearchStore'
import usePersistStore from 'store/usePersistStore'
import useLang from 'lang'
import Loading from 'components/LoadingOverlay/LoadingOverlay'
import { SingleValue } from 'react-select'
import useGlobalStore from 'store/useGlobalStore'
import Image from 'components/Image'

import searchIcon from 'assets/magnifying-glass-search.svg'

const Search = (): JSX.Element => {
  const [searchText, setSearchText] = useState('')
  const { cacheList: list, loading, search, resetComic, getList } = useSearchStore()
  const { repo, setRepo } = usePersistStore()
  const { repoList } = useGlobalStore()
  const inputRef = useRef(null) as MutableRefObject<null> | MutableRefObject<HTMLInputElement>

  useEffect(() => {
    if (!(repo in repoList)) {
      if (repoList[0]) setRepo(repoList[0].value)
    }
  }, [])

  const noRepos = !repoList.length

  const texts = useLang()

  type TOption = SingleValue<{
    value: string
    label: string
  }>

  const handleChangeRepo = (e: TOption): void => {
    if (e) setRepo(e.value)
    getList()

    if (inputRef.current) inputRef.current.value = ''
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchText(e.target.value)
  }

  const debouncedResults = useMemo(() => {
    return debounce(handleSearch, 1500)
  }, [])

  useEffect(() => {
    return () => {
      resetComic()
      debouncedResults.cancel()
    }
  }, [])

  useMemo(() => {
    if (!noRepos && !!repo) {
      if (searchText.length) search(searchText)
      if (!searchText.length) getList()
    }
  }, [searchText])

  return (
    <>
      <Loading isLoading={loading} />
      <div className="w-full h-24 flex-shrink-0 px-10 py-6">
        <div className="h-full w-full bg-default shadow-default rounded flex justify-center items-center pr-4 ">
          <Select
            defaultValue={repoList.find((val) => val?.value === repo)}
            options={repoList}
            onChange={(e) => handleChangeRepo(e as TOption)}
            isDisabled={noRepos}
          />
          <input
            className="flex-grow bg-transparent text-lg pl-5"
            placeholder={texts.SearchComic.textPlaceholder}
            type="text"
            onChange={debouncedResults}
            ref={inputRef}
          />
          <Image
            src={searchIcon}
            svg
            className="h-full aspect-square bg-text-default p-2 opacity-40"
          />
        </div>
      </div>
      <div className="flex-grow">
        <SearchComicList list={list} />
      </div>
    </>
  )
}

const windowSettings = {
  windowProps: {
    className: 'h-full w-full',
    contentClassName: 'h-full w-full flex flex-col overflow-hidden items-center',
    closeable: true,
    titleBar: true,
    unique: true,
    title: 'Search'
  },
  initialStatus: {
    startPosition: 'center',
    width: '90%',
    height: '90%'
  }
} as TWindow

export default { Search, ...windowSettings }
