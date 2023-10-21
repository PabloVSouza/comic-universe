import classNames from 'classnames'
import slugify from 'slugify'
import ReactHtmlParser from 'react-html-parser'

import ProgressBar from 'components/ProgressBar/Index'
import Image from 'components/Image'

import loadingImage from 'assets/OldLoading.gif'

import useDashboardStore from 'store/useDashboardStore'
import useDownloadStore from 'store/useDownloadStore'
import useGlobalStore from 'store/useGlobalStore'

import style from './style.module.scss'

const { path } = window

const ComicListItem = ({ item }: { item: ComicInterface }): JSX.Element => {
  const { appPath } = useGlobalStore()
  const { comic, setComic } = useDashboardStore()
  const { queue } = useDownloadStore()

  const inQueue = queue.filter((value) => value.comicId == item.id).length ?? 0
  const active = comic.id === item.id
  const isDownloading = !!inQueue

  const totalChapters = item.chapters.length
  const downloadProgress = (inQueue - totalChapters) * -1

  const handleClick = (): void => {
    if (!isDownloading) setComic(item.id)
  }

  const cover = item.cover.startsWith('http')
    ? item.cover
    : `file:///${path.join(appPath, 'downloads', item.type, slugify(item.name), item.cover)}`

  return (
    <li
      className={classNames(
        style.comicListItem,
        !isDownloading ? style.regular : '',
        active ? style.active : null
      )}
      onClick={(): void => handleClick()}
    >
      {isDownloading ? (
        <>
          <div className={style.progress}>
            <ProgressBar total={totalChapters} current={downloadProgress} />
            <Image className={style.downloadImage} src={loadingImage} />
          </div>
        </>
      ) : (
        <p className={style.name}>{ReactHtmlParser(item.name)}</p>
      )}
      <Image className={style.cover} src={cover} />
    </li>
  )
}

export default ComicListItem
