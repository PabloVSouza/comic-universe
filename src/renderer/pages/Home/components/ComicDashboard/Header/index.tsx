import slugify from 'slugify'
import Image from 'components/Image'

import useDashboardStore from 'store/useDashboardStore'
import useGlobalStore from 'store/useGlobalStore'

import style from './style.module.scss'

const DashboardHeader = (): JSX.Element => {
  const { appPath } = useGlobalStore()

  const { comic } = useDashboardStore()

  const cover = comic?.cover.startsWith('http')
    ? comic.cover
    : `file:///${window.path.join(
        appPath,
        'downloads',
        comic.type,
        slugify(comic.name),
        comic.cover
      )}`

  return (
    <div className={style.DashboardHeader}>
      <div className={style.texts}>
        <div className={style.title}>
          <h1>{comic.name}</h1>
          <p>{comic.publisher}</p>
          <p>{comic.status}</p>
        </div>
        <div className={style.synopsis}>
          <p>{comic.synopsis}</p>
        </div>
      </div>
      <Image className={style.cover} src={cover} />
    </div>
  )
}

export default DashboardHeader
