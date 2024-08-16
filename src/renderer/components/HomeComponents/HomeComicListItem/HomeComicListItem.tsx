import classNames from 'classnames'
import slugify from 'slugify'
import ReactHtmlParser from 'react-html-parser'

import ProgressBar from 'components/ProgressBar/ProgressBar'
import Image from 'components/Image/Image'

import loadingImage from 'assets/loading.svg'

import useDashboardStore from 'store/useDashboardStore'
import useDownloadStore from 'store/useDownloadStore'
import useGlobalStore from 'store/useGlobalStore'

const { path } = window

const ComicListItem = ({
  item,
  ...props
}: { item: ComicInterface } & Partial<React.LiHTMLAttributes<HTMLLIElement>>): JSX.Element => {
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
        'w-full h-24 overflow-hidden flex flex-shrink-0 items-center justify-center bg-list-item relative cursor-pointer transition-colors',
        !isDownloading ? 'hover:bg-list-item-hover hover:text-text-oposite' : '',
        active ? '!bg-list-item-active text-text-oposite' : null
      )}
      onClick={handleClick}
      {...props}
    >
      {isDownloading ? (
        <div className="flex-grow h-full flex justify-center items-center">
          <ProgressBar total={totalChapters} current={downloadProgress} />
          <Image className="absolute h-1/2" src={loadingImage} />
        </div>
      ) : (
        <p className="flex-grow py-1 h-full flex justify-center items-center text-center">
          {ReactHtmlParser(item.name)}
        </p>
      )}
      <Image
        className="flex-shrink-0 h-full aspect-[10/16] object-cover object-center"
        src={cover}
      />
    </li>
  )
}

export default ComicListItem
