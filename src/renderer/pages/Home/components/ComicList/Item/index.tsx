import slugify from 'slugify'
import classNames from 'classnames'

import Image from 'components/Image'
import useGlobalStore from 'store/useGlobalStore'
import useDashboardStore from 'store/useDashboardStore'

import style from './style.module.scss'

const { path } = window

const ComicListItem = ({ item }: { item: Comic }): JSX.Element => {
  const { appPath } = useGlobalStore()
  const { comic, setComic } = useDashboardStore()

  const active = comic._id === item._id

  const cover = item.cover.startsWith('http')
    ? item.cover
    : `file:///${path.join(appPath, 'downloads', item.type, slugify(item.name), item.cover)}`

  return (
    <li
      className={classNames(style.comicListItem, active ? style.active : null)}
      onClick={(): void => setComic(item)}
    >
      <p className={style.name}>{item.name}</p>
      <Image className={style.cover} src={cover} />
    </li>
  )
}

export default ComicListItem
