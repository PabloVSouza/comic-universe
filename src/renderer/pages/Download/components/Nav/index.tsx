import Button from 'components/Button'
import useLang from 'lang'
import style from './style.module.scss'

import clipboardIcon from 'assets/clipboard.svg'
import downloadIcon from 'assets/download-icon-2.svg'
import Container from 'components/Container'
import useComicData from 'store/comic'
import useDashboard from 'store/dashboard'

const DownloadChapterNav = (): JSX.Element => {
  const texts = useLang()

  const { downloadChapter, chapters, queue, setQueue, downloadedChapters } = useComicData(
    (state) => state
  )
  const { getListDB } = useDashboard((state) => state)

  const addAllToQueue = (): void => {
    if (queue.length + downloadedChapters.length === chapters.length) {
      setQueue([])
    } else {
      const filteredChapters = chapters.filter((val) => {
        if (!downloadedChapters.find((item) => item.id === val.id)) {
          return val
        }
        return null
      })

      const newQueue = Array.from(new Set(queue.concat(filteredChapters)))
      setQueue(newQueue)
    }
  }

  const downloadQueue = async (): Promise<void> => {
    for (const item of queue) {
      await downloadChapter(item)
    }
    setQueue([])
    getListDB()
  }

  return (
    <div className={style.downloadChapterNav}>
      <Container className={style.container}>
        <div className={style.chapters}>Capítulos: {chapters.length}</div>
        <div className={style.queue}>
          {texts.DownloadComic.navigation.downloadQueue}: {queue.length}
        </div>
        <div className={style.buttons}>
          <Button
            theme="pure"
            onClick={(): void => addAllToQueue()}
            title={texts.DownloadComic.navigation.addToQueue}
            icon={clipboardIcon}
          />
          <Button
            theme="pure"
            onClick={(): Promise<void> => downloadQueue()}
            title={texts.DownloadComic.navigation.downloadButton}
            icon={downloadIcon}
          />
        </div>
      </Container>
    </div>
  )
}

export default DownloadChapterNav
