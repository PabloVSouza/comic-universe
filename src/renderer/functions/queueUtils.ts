export const addChaptersToQueue = async (
  comicList: IComic[],
  addToQueue: (chapter: IChapter) => void,
  invoke: (method: string, params?: unknown) => Promise<unknown>
): Promise<void> => {
  if (comicList && comicList.length > 0) {
    const noPageChapters = await invoke('dbGetAllChaptersNoPage') as IChapter[]
    noPageChapters.forEach((chapter) => addToQueue(chapter))
  }
}
