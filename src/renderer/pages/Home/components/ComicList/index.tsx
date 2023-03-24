import ComicListItem from './Item'
import useDashboardStore from 'store/useDashboardStore'

import style from './style.module.scss'

const ComicList = (): JSX.Element => {
  const { list } = useDashboardStore()
  return (
    <ul className={style.comicList}>
      {list.map((item) => (
        <ComicListItem key={item._id} item={item} />
      ))}
    </ul>
  )
}

export default ComicList
