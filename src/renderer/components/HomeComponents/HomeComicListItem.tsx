import classNames from 'classnames'
import slugify from 'slugify'
import ReactHtmlParser from 'react-html-parser'
import ProgressBar from 'components/ProgressBar'
import Image from 'components/Image'

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
        'w-full h-24 overflow-hidden flex flex-shrink-0 items-center justify-center bg-list-item relative cursor-pointer transition-colors backdrop-blur-sm',
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
        <p className="line-clamp-3 text-center p-1 flex-grow">{ReactHtmlParser(item.name)}</p>
      )}
      <Image
        className="flex-shrink-0 h-full aspect-[10/16] object-cover object-center"
        src={cover}
      />
    </li>
  )
}

export default ComicListItem
