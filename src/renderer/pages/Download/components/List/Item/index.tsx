import useComicData from 'store/comic'
import classNames from 'classnames'

import style from './style.module.scss'

const DownloadChapterListItem = ({ data }: { data: Chapter }): JSX.Element => {
  const { downloadedChapters, queue, setQueue } = useComicData((state) => state)

  const downloaded = !!downloadedChapters.find((e) => e.number == data.number)
  const active = !!queue.find((e) => e.number == data.number)

  const addToQueue = (): void => {
    if (!downloaded) {
      const found = queue.findIndex((val) => val.number === data.number)
      if (found < 0) {
        setQueue([...queue, data])
      }
      if (found >= 0) {
        const newQueue = queue.filter((val) => val.number !== data.number)
        setQueue(newQueue)
      }
    }
  }

  return (
    <li
      className={classNames(
        style.downloadChapterListItem,
        active ? style.active : null,
        downloaded ? style.downloaded : null
      )}
      onClick={(): void => addToQueue()}
    >
      <p>{data.number}</p>
      {!!data.date && <span>{data.date}</span>}
    </li>
  )
}

export default DownloadChapterListItem
