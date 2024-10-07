import { useMutation } from '@tanstack/react-query'
import useApi from 'api'
import timeoutPromise from 'functions/timeoutPromise'
import { confirmAlert } from 'components/Alert'
import useQueue from './useQueue'

const useFetchData = () => {
  const { invoke } = useApi()

  const { mutateAsync: fetchNewChapters } = useMutation({
    mutationFn: async (comic: IComic) => {
      const { repo, siteId, id: comicId } = comic

      const webChaptersList = (await invoke('getChapters', {
        repo,
        data: { siteId }
      })) as IChapter[]
      const dbChaptersList = (await invoke('dbGetChapters', { comicId })) as IChapter[]
      const newChapters = webChaptersList.filter(
        (chapter) => !dbChaptersList.find((val) => val.number === chapter.number)
      )

      return newChapters
    }
  })

  const { mutate: fetchChapterPages } = useMutation({
    mutationFn: async (chapter: IChapter): Promise<boolean> => {
      const { repo } = chapter
      const pages = await timeoutPromise<IPage[]>(
        invoke('getPages', { repo, data: { chapter } }),
        10000
      )
      if (pages.length > 0) {
        await invoke('dbUpdateChapter', { chapter: { ...chapter, pages: JSON.stringify(pages) } })
      }
      return pages.length > 0
    },
    onSuccess: (data, chapter) => {
      if (data) {
        const { removeFromQueue } = useQueue(useFetchData)
        removeFromQueue(chapter)
      }
    },
    onError: () => {
      confirmAlert({
        message: 'Failed to Download some Chapters Information'
      })
    },
    retry: 3
  })

  return { fetchNewChapters, fetchChapterPages }
}

export default useFetchData
