import { useState, useMemo } from 'react'
import classNames from 'classnames'
import Window from 'components/Window'
import SearchComicList from './components/List'
import Select from 'react-select'
import useComicData from 'store/comic'
import useLang from 'lang'
import style from './style.module.scss'

const ModalSearch = (): JSX.Element => {
  const [search, setSearch] = useState('')
  const [filteredList, setFilteredList] = useState<Comic[]>([])
  const { list, getList, resetComic, type, setType } = useComicData((state) => state)

  const texts = useLang()

  const setList = (): void => {
    search.length > 0
      ? setFilteredList(
          list.filter((val) => val.name.toUpperCase().startsWith(search.toUpperCase()))
        )
      : setFilteredList(list)
  }

  const selectOptions = [
    { value: 'hq', label: 'HQs' },
    { value: 'manga', label: 'Mangás' }
  ]

  const handleChange = (option): void => {
    if (option) setType(option.value)
  }

  useMemo(() => {
    if (list.length == 0) setList()
  }, [])

  useMemo(() => {
    getList()
  }, [type])

  useMemo(() => {
    setList()
  }, [list, search])

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
            defaultValue={selectOptions.find((val) => val.value === type)}
            options={selectOptions}
            onChange={handleChange}
            unstyled
            isSearchable={false}
          />
        </div>
        <div className={classNames(style.inputBlock, style.inputText)}>
          <input
            className={style.inputElement}
            placeholder={texts.SearchComic.textPlaceholder}
            type="text"
            onChange={(e): void => setSearch(e.target.value)}
          />
        </div>
        <div className={classNames(style.inputBlock, style.inputIcon)}>
          <div className={style.searchIcon} />
        </div>
      </div>
      <div className={style.result}>
        <SearchComicList list={filteredList} />
      </div>
    </Window>
  )
}

export default ModalSearch