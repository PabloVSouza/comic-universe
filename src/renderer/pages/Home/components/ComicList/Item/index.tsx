import slugify from 'slugify'
import classNames from 'classnames'

import Image from 'components/Image'
import useGlobal from 'store/global'
import useDashboard from 'store/dashboard'

import style from './style.module.scss'

const { path } = window

const ComicListItem = ({ item }: { item: Comic }): JSX.Element => {
  const { appPath } = useGlobal((state) => state)
  const { activeComic, setActiveComic } = useDashboard((state) => state)

  const active = activeComic._id === item._id

  const cover = item.cover.startsWith('http')
    ? item.cover
    : `file:///${path.join(appPath, 'downloads', item.type, slugify(item.name), item.cover)}`

  return (
    <li
      className={classNames(style.comicListItem, active ? style.active : null)}
      onClick={(): void => setActiveComic(item)}
    >
      <p className={style.name}>{item.name}</p>
      <Image className={style.cover} src={cover} />
    </li>
  )
}

export default ComicListItem
