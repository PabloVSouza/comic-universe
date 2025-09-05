export const addChaptersToQueue = async (
  comicList: IComic[],
  addToQueue: (chapter: IChapter) => void,
  invoke: (method: string, params?: any) => Promise<any>
): Promise<void> => {
  if (comicList && comicList.length > 0) {
    const noPageChapters: IChapter[] = await invoke('dbGetAllChaptersNoPage')
    noPageChapters.forEach((chapter) => addToQueue(chapter))
  }
}
