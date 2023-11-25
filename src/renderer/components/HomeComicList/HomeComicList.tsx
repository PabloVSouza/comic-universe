import ComicListItem from './HomeComicListItem/HomeComicListItem'
import useDashboardStore from 'store/useDashboardStore'

import style from './style.module.scss'

const HomeComicList = (): JSX.Element => {
  const { list } = useDashboardStore()
  return (
    <ul className={style.comicList}>
      {list.map((item) => (
        <ComicListItem key={item.id} item={item} />
      ))}
    </ul>
  )
}

export default HomeComicList
