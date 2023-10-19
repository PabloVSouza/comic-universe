import slugify from 'slugify'
import classNames from 'classnames'
import ReactHtmlParser from 'react-html-parser'

import ProgressBar from 'components/ProgressBar/Index'
import Image from 'components/Image'

import useGlobalStore from 'store/useGlobalStore'
import useDashboardStore from 'store/useDashboardStore'

import style from './style.module.scss'
import useDownloadStore from 'store/useDownloadStore'

const { path } = window

const ComicListItem = ({ item }: { item: ComicInterface }): JSX.Element => {
  const { appPath } = useGlobalStore()
  const { comic, setComic } = useDashboardStore()
  const { queue } = useDownloadStore()

  const active = comic.id === item.id

  const inQueue = queue.filter((value) => value.comicId == item.id).length ?? 0
  const isDownloading = !!inQueue
  const totalChapters = item.chapters.length
  const downloadProgress = (inQueue - totalChapters) * -1

  const cover = item.cover.startsWith('http')
    ? item.cover
    : `file:///${path.join(appPath, 'downloads', item.type, slugify(item.name), item.cover)}`

  return (
    <li
      className={classNames(style.comicListItem, active ? style.active : null)}
      onClick={(): Promise<void> => setComic(item)}
    >
      {isDownloading ? (
        <ProgressBar total={totalChapters} current={downloadProgress} showPercentage />
      ) : (
        <p className={style.name}>{ReactHtmlParser(item.name)}</p>
      )}
      <Image className={style.cover} src={cover} />
    </li>
  )
}

export default ComicListItem
