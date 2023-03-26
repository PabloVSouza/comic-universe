import { useState, useMemo, useEffect } from 'react'
import debounce from 'lodash.debounce'
import classNames from 'classnames'
import Window from 'components/Window'
import SearchComicList from './components/List'
import Select, { SingleValue } from 'react-select'
import useSearchStore from 'store/useSearchStore'
import usePersistStore from 'store/usePersistStore'
import useLang from 'lang'
import style from './style.module.scss'

const ModalSearch = (): JSX.Element => {
  const [searchText, setSearchText] = useState('')
  const { list, search, resetComic, getList } = useSearchStore()
  const { repo, setRepo } = usePersistStore()

  const texts = useLang()

  const selectOptions = [
    { value: 'hqnow', label: 'HQ Now' },
    { value: 'firemangas', label: 'Fire Mangas' },
    { value: 'mangalivre', label: 'Manga Livre' }
  ]

  const handleChangeRepo = (
    option: SingleValue<{
      value: string
      label: string
    }>
  ): void => {
    if (option) setRepo(option.value)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchText(e.target.value)
  }

  const debouncedResults = useMemo(() => {
    return debounce(handleSearch, 500)
  }, [])

  useEffect(() => {
    return () => {
      debouncedResults.cancel()
    }
  })

  useMemo(() => {
    if (searchText.length > 0) search(searchText)
    if (searchText.length === 0) getList()
  }, [searchText])

  return (
    <Window
      close
      to={'/'}
      onClick={(): void => resetComic()}
      className={style.searchComic}
      contentClassName={style.content}
    >
      <div className={style.searchInput}>
        <div className={classNames(style.inputBlock, style.inputSelect)}>
          <Select
            className={style.select}
            defaultValue={selectOptions.find((val) => val.value === repo)}
            options={selectOptions}
            onChange={handleChangeRepo}
            unstyled
            isSearchable={false}
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
