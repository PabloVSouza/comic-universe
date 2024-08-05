import { useState, useMemo, useEffect } from 'react'
import debounce from 'lodash.debounce'
import classNames from 'classnames'
import Window from 'components/WindowManager/Window'
import SearchComicList from 'components/SearchComponents/SearchComicList/SearchComicList'
import Select from 'components/Select'
import useSearchStore from 'store/useSearchStore'
import usePersistStore from 'store/usePersistStore'
import useLang from 'lang'
import style from './style.module.scss'
import Loading from 'components/LoadingOverlay/LoadingOverlay'
import { SingleValue } from 'react-select'
import useGlobalStore from 'store/useGlobalStore'

const ModalSearch = (): JSX.Element => {
  const [searchText, setSearchText] = useState('')
  const { list, loading, search, resetComic, getList } = useSearchStore()
  const { repo, setRepo } = usePersistStore()
  const { repoList } = useGlobalStore()

  const texts = useLang()

  type TOption = SingleValue<{
    value: string
    label: string
  }>

  const handleChangeRepo = (e: TOption): void => {
    if (e) setRepo(e.value)
    getList()
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchText(e.target.value)
  }

  const debouncedResults = useMemo(() => {
    return debounce(handleSearch, 1500)
  }, [])

  useEffect(() => {
    return () => {
      debouncedResults.cancel()
    }
  })

  useMemo(() => {
    if (searchText.length) search(searchText)
    if (!searchText.length) getList()
  }, [searchText])

  return (
    <Window
      close
      to={'/'}
      onClick={(): void => resetComic()}
      className={style.searchComic}
      contentClassName={style.content}
    >
      <Loading isLoading={loading} />
      <div className={style.searchInput}>
        <div className={classNames(style.inputBlock, style.inputSelect)}>
          <Select
            defaultValue={repoList.find((val) => val?.value === repo)}
            options={repoList}
            onChange={(e) => handleChangeRepo(e as TOption)}
          />
        </div>
        <div className={classNames(style.inputBlock, style.inputText)}>
          <input
            className={style.inputElement}
            placeholder={texts.SearchComic.textPlaceholder}
            type="text"
            onChange={debouncedResults}
          />
        </div>
        <div className={classNames(style.inputBlock, style.inputIcon)}>
          <div className={style.searchIcon} />
        </div>
      </div>
      <div className={style.result}>
        <SearchComicList list={list} />
      </div>
    </Window>
  )
}

export default ModalSearch
