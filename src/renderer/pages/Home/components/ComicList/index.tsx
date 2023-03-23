import ComicListItem from './Item'
import useDashboard from 'store/dashboard'

import style from './style.module.scss'

const ComicList = (): JSX.Element => {
  const { list } = useDashboard()
  return (
    <ul className={style.comicList}>
      {list.map((item) => (
        <ComicListItem key={item._id} item={item} />
      ))}
    </ul>
  )
}

export default ComicList
