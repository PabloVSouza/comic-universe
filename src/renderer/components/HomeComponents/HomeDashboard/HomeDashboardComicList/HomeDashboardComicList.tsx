import DashboardListItem from '../HomeDashboardComicListItem'

import useDashboardStore from 'store/useDashboardStore'

import style from './HomeDashboardComicList.module.scss'

const HomeDashboardComicList = (): JSX.Element => {
  const { comic } = useDashboardStore()

  return (
    <ul className={style.HomeDashboardComicList}>
      {comic.chapters.map((item) => (
        <DashboardListItem key={item.id} item={item} />
      ))}
    </ul>
  )
}

export default HomeDashboardComicList
