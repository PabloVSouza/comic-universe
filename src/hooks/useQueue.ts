import { useState, useEffect } from 'react'
import { UseMutateFunction } from '@tanstack/react-query'
import useGlobalStore from 'store/useGlobalStore'

interface UseQueueReturn {
  addToQueue: (chapter: IChapter) => void
  removeFromQueue: (chapter: IChapter) => void
  inProgress: IChapter[]
}

const useQueue = (
  fetchChapterPages: UseMutateFunction<boolean, unknown, IChapter, unknown>
): UseQueueReturn => {
  const { queue, setQueue } = useGlobalStore()
  const [inProgress, setInProgress] = useState<IChapter[]>([])

  const addToQueue = (chapter: IChapter): void => {
    setQueue((prevQueue) => {
      if (!prevQueue.find((item) => item.id === chapter.id)) {
        return [...prevQueue, chapter]
      }
      return prevQueue
    })
  }

  const removeFromQueue = (chapter: IChapter): void => {
    setQueue((prevQueue) => prevQueue.filter((item) => item.id !== chapter.id))
    setInProgress((prevInProgress) => prevInProgress.filter((item) => item.id !== chapter.id))
  }

  useEffect(() => {
    const notInProgress = queue.filter(
      (chapter) => !inProgress.find((item) => item.id === chapter.id)
    )
    if (notInProgress.length > 0) {
      setInProgress((prevInProgress) => [...prevInProgress, ...notInProgress])
      notInProgress.forEach((chapter) => {
        fetchChapterPages(chapter)
      })
    }
  }, [queue, inProgress, fetchChapterPages])

  return { addToQueue, removeFromQueue, inProgress }
}

export default useQueue
