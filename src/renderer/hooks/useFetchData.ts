import { useMutation, useQueryClient } from '@tanstack/react-query'
import useApi from 'api'
import { confirmAlert } from 'components/Alert'
import timeoutPromise from 'functions/timeoutPromise'

const useFetchData = (userId: string) => {
  const { invoke } = useApi()
  const queryClient = useQueryClient()

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

  const { mutate: insertComic } = useMutation({
    mutationFn: async ({
      data,
      comicDetails,
      chapterData,
      repo
    }: {
      data: IComic
      comicDetails: IComic
      chapterData: IChapter[]
      repo: string
    }): Promise<void> =>
      await invoke('dbInsertComic', {
        comic: { ...data, ...comicDetails },
        chapters: chapterData,
        repo,
        userId
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comicList', userId] })
  })

  const { mutate: insertChapters } = useMutation({
    mutationFn: async ({
      newChapters,
      comicId
    }: {
      newChapters: IChapter[]
      comicId: string
    }): Promise<void> => {
      const finalChapters = newChapters.map((val) => ({ ...val, comicId }))
      await invoke('dbInsertChapters', { chapters: finalChapters })
    },

    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comicList'] })
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
    onSuccess: (data) => {
      if (data) {
        // Queue removal should be handled by the component using useQueue
      }
    },
    onError: () => {
      confirmAlert({
        message: 'Failed to Download some Chapters Information'
      })
    },
    retry: 3
  })

  return { fetchNewChapters, fetchChapterPages, insertComic, insertChapters }
}

export default useFetchData
