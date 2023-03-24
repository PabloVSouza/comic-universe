import slugify from 'slugify'
import Image from 'components/Image'

import useGlobal from 'store/global'

import style from './style.module.scss'

const DashboardHeader = ({ item }: { item: Comic }): JSX.Element => {
  const { appPath } = useGlobal((state) => state)

  const cover = item.cover.startsWith('http')
    ? item.cover
    : `file:///${window.path.join(appPath, 'downloads', item.type, slugify(item.name), item.cover)}`

  return (
    <div className={style.DashboardHeader}>
      <div className={style.texts}>
        <div className={style.title}>
          <h1>{item.name}</h1>
          <p>{item.publisher}</p>
          <p>{item.status}</p>
        </div>
        <div className={style.synopsis}>
          <p>{item.synopsis}</p>
        </div>
      </div>
      <Image className={style.cover} src={cover} />
    </div>
  )
}

export default DashboardHeader
