import slugify from 'slugify'
import HtmlParser from 'react-html-parser'

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
          <h1>{HtmlParser(comic.name)}</h1>
          {!!comic.publisher && <p>{comic.publisher}</p>}
          {!!comic.status && <p>{comic.status}</p>}
          {!!comic.genres && <p>{!!comic.genres && JSON.parse(comic.genres).join(', ')}</p>}
        </div>
        <div className={style.synopsis}>
          <p>{HtmlParser(comic.synopsis)}</p>
        </div>
      </div>
      <Image className={style.cover} src={cover} />
    </div>
  )
}

export default DashboardHeader
