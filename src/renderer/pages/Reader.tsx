import { useEffect, useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import Image from 'components/Image'
import useApi from 'api'
import FixFilePaths from 'functions/fixFilePaths'
import useGlobalStore from 'store/useGlobalStore'
import usePersistSessionStore from 'store/usePersistSessionStore'
import ReaderZoomWindow, { IMousePos } from 'components/ZoomWindow'
import ReaderBottomBar from 'components/ReaderComponents/ReaderBottomBar'

import loading from 'assets/loading.svg'
import Cover from 'components/Cover'

const Reader = (): React.JSX.Element => {
  const navigate = useNavigate()
  const { invoke } = useApi()
  const queryClient = useQueryClient()
  const { activeComic, setActiveComic } = useGlobalStore()
  const { currentUser } = usePersistSessionStore()
  const [mousePos, setMousePos] = useState<IMousePos>({} as IMousePos)
  const [zoomVisible, setZoomVisible] = useState(false)
  const [currentReadingMode, setCurrentReadingMode] = useState<'horizontal' | 'vertical'>(
    'horizontal'
  )
  const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(null)
  const [isScrollingProgrammatically, setIsScrollingProgrammatically] = useState(false)
  const [shouldScrollToPage, setShouldScrollToPage] = useState(false)
  const comicId = Number(useParams().comicId)
  const chapterId = Number(useParams().chapterId)

  const { data: userSettings } = useQuery({
    queryKey: ['userSettings', currentUser.id],
    queryFn: async () => {
      if (currentUser.id) {
        return await invoke('dbGetUserSettings', { userId: currentUser.id })
      }
      return null
    },
    enabled: !!currentUser.id,
    initialData: null
  })

  const readingDirection = userSettings?.readingPreferences?.readingDirection || 'ltr'
  const defaultReadingMode =
    activeComic.type === 'manhwa' || activeComic.type === 'manhua' ? 'vertical' : 'horizontal'
  const readingMode = currentReadingMode

  const handleScroll = (): void => {
    if (
      readingMode === 'vertical' &&
      scrollContainer &&
      pages.length > 0 &&
      !isScrollingProgrammatically
    ) {
      const scrollTop = scrollContainer.scrollTop
      const containerHeight = scrollContainer.clientHeight

      const pageHeight = containerHeight
      const currentPageIndex = Math.round(scrollTop / pageHeight) + 1
      const clampedPage = Math.max(1, Math.min(currentPageIndex, pages.length))

      if (readProgress && readProgress.page !== clampedPage) {
        const newReadProgress = { ...readProgress, page: clampedPage } as IReadProgress
        updateReadProgress(newReadProgress)
      }
    }
  }

  const debouncedHandleScroll = (() => {
    let timeoutId: NodeJS.Timeout
    return () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleScroll, 200)
    }
  })()

  useQuery({
    queryKey: ['activeComicData'],
    queryFn: async () => {
      const comicData = (await invoke('dbGetComicAdditionalData', {
        id: comicId,
        userId: currentUser.id
      })) as IComic
      if (!activeComic.id || !activeComic.chapters) setActiveComic(comicData)
      return comicData
    },
    enabled: (!!currentUser.id && !activeComic.id) || !activeComic.chapters
  })

  const chapter = activeComic?.chapters?.find((val) => val.id == chapterId)
  const chapters = activeComic?.chapters
  const chapterIndex = chapters?.findIndex((val) => val.id === chapterId) ?? 0
  const pages = JSON.parse(chapter?.pages ?? '[]') as IPage[]

  const getReadProgress = async () => {
    let result = await invoke('dbGetReadProgress', { chapterId, userId: currentUser.id })
    if (!result.length) {
      await invoke('dbUpdateReadProgress', {
        readProgress: {
          chapterId,
          comicId,
          page: 1,
          userId: currentUser.id ?? 0,
          totalPages: pages.length ?? 0
        }
      })
      result = await invoke('dbGetReadProgress', { chapterId, userId: currentUser.id })
    }

    return result[0] as IReadProgress
  }

  const { data: readProgress } = useQuery({
    queryKey: ['readProgressData'],
    queryFn: async () => await getReadProgress(),
    enabled: !!activeComic.id && !!currentUser.id && !!(chapter?.pages?.length ?? 0)
  })

  useEffect(() => {
    if (scrollContainer && readingMode === 'vertical') {
      scrollContainer.addEventListener('scroll', debouncedHandleScroll, { passive: true })
      return () => {
        scrollContainer.removeEventListener('scroll', debouncedHandleScroll)
      }
    }
    return undefined
  }, [scrollContainer, readingMode, debouncedHandleScroll])

  const resetQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['activeComicData'] })
    queryClient.invalidateQueries({ queryKey: ['readProgressData'] })
  }, [queryClient])

  const { mutate: updateReadProgress } = useMutation({
    mutationFn: async (readProgress: IReadProgress) => {
      await invoke('dbUpdateReadProgress', { readProgress })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['readProgressData'] })
  })

  const { mutate: updateReadingMode } = useMutation({
    mutationFn: async (readingMode: 'horizontal' | 'vertical') => {
      if (!activeComic.id) return
      await invoke('dbUpdateComic', { id: activeComic.id, comic: { readingMode } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comicData'] })
      queryClient.invalidateQueries({ queryKey: ['activeComic'] })
    }
  })

  useEffect(() => {
    if (!currentReadingMode && activeComic.id) {
      if (activeComic.readingMode) {
        setCurrentReadingMode(activeComic.readingMode)
      } else {
        setCurrentReadingMode(defaultReadingMode)
        if (activeComic.id) {
          setActiveComic({ ...activeComic, readingMode: defaultReadingMode })
          updateReadingMode(defaultReadingMode)
        }
      }
    }
  }, [
    defaultReadingMode,
    activeComic.readingMode,
    activeComic.id,
    currentReadingMode,
    activeComic,
    setActiveComic,
    updateReadingMode
  ])

  useEffect(() => {
    if (readProgress && readProgress.page === 0) {
      const newReadProgress = { ...readProgress, page: 1 } as IReadProgress
      updateReadProgress(newReadProgress)
    }
  }, [readProgress, updateReadProgress])

  const nextPage = useCallback(async (): Promise<void> => {
    if (readProgress) {
      const { page, totalPages } = readProgress

      if (page < totalPages) {
        const newReadProgress = { ...readProgress, page: page + 1 } as IReadProgress
        updateReadProgress(newReadProgress)
        if (readingMode === 'vertical') {
          setShouldScrollToPage(true)
        }
      } else if (page === totalPages) {
        if (chapterIndex === (chapters?.length || 0) - 1) {
          navigate('/')
        } else if (chapterIndex < (activeComic.chapters?.length || 0) - 1) {
          navigate(`/reader/${comicId}/${activeComic.chapters?.[chapterIndex + 1]?.id}`)
        }
      }
    }
  }, [
    readProgress,
    updateReadProgress,
    readingMode,
    setShouldScrollToPage,
    chapterIndex,
    activeComic.chapters,
    navigate,
    comicId,
    chapters?.length
  ])

  const previousPage = useCallback(async (): Promise<void> => {
    if (readProgress) {
      const { page } = readProgress
      if (page > 1) {
        const newReadProgress = { ...readProgress, page: page - 1 } as IReadProgress
        updateReadProgress(newReadProgress)
        if (readingMode === 'vertical') {
          setShouldScrollToPage(true)
        }
      } else if (page === 1) {
        if (chapterIndex === 0) {
          navigate('/')
        } else if (chapterIndex > 0) {
          navigate(`/reader/${comicId}/${activeComic.chapters?.[chapterIndex - 1]?.id}`)
        }
      }
    }
  }, [
    readProgress,
    updateReadProgress,
    readingMode,
    setShouldScrollToPage,
    chapterIndex,
    activeComic.chapters,
    navigate,
    comicId
  ])

  const handleKeys = useCallback(
    (e: KeyboardEvent): void => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault()
      }

      const keys = {
        ArrowLeft: (): void => {
          if (readingMode === 'vertical') {
            previousPage()
            return
          }
          if (readingDirection === 'rtl') {
            nextPage()
          } else {
            previousPage()
          }
        },

        ArrowRight: (): void => {
          if (readingMode === 'vertical') {
            nextPage()
            return
          }
          if (readingDirection === 'rtl') {
            previousPage()
          } else {
            nextPage()
          }
        },

        ArrowUp: (): void => {
          if (readingMode === 'vertical') {
            previousPage()
          }
        },

        ArrowDown: (): void => {
          if (readingMode === 'vertical') {
            nextPage()
          }
        },

        Escape: (): void => {
          navigate('/')
        }
      }

      if (keys[e.key]) {
        keys[e.key]()
      }
    },
    [readingMode, readingDirection, nextPage, previousPage, navigate]
  )

  const defineMousePos = (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    setMousePos({ x: e.pageX, y: e.pageY })
  }

  const toggleReadingMode = (): void => {
    const newMode = currentReadingMode === 'horizontal' ? 'vertical' : 'horizontal'
    setCurrentReadingMode(newMode)
    if (activeComic.id) {
      setActiveComic({ ...activeComic, readingMode: newMode })
      updateReadingMode(newMode)
      setShouldScrollToPage(true)
    }
  }

  const position = {
    transform:
      readingMode === 'vertical'
        ? `translate3d(0, -${((readProgress?.page ?? 1) - 1) * 100}%, 0)`
        : readingDirection === 'rtl'
          ? `translate3d(-${(pages.length - (readProgress?.page ?? 1)) * 100}%,0,0)`
          : `translate3d(-${((readProgress?.page ?? 1) - 1) * 100}%,0,0)`
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeys)
    return () => {
      document.removeEventListener('keydown', handleKeys)
    }
  }, [activeComic, chapterIndex, readProgress, handleKeys])

  useEffect(() => {
    resetQueries()
    setShouldScrollToPage(true)
  }, [chapterId, resetQueries])

  useEffect(() => {
    if (scrollContainer && readingMode === 'vertical' && readProgress && shouldScrollToPage) {
      const containerHeight = scrollContainer.clientHeight
      const pageHeight = containerHeight
      const scrollTop = (readProgress.page - 1) * pageHeight

      setIsScrollingProgrammatically(true)
      scrollContainer.scrollTo({ top: scrollTop, behavior: 'auto' })

      setTimeout(() => {
        setIsScrollingProgrammatically(false)
        setShouldScrollToPage(false)
      }, 100)
    }
  }, [chapterId, readingMode, scrollContainer, readProgress, shouldScrollToPage])
  return (
    <Cover visible>
      <div className="w-full h-full flex flex-col">
        <div
          className="flex-1 relative overflow-hidden"
          onMouseMoveCapture={defineMousePos}
          onContextMenu={(): void => setZoomVisible(!zoomVisible)}
          onWheel={(e): void => {
            if (readingMode === 'horizontal') {
              e.preventDefault()
            }
          }}
        >
          {!!pages?.length && readProgress?.page && (
            <ReaderZoomWindow
              mousePos={mousePos}
              image={
                FixFilePaths(
                  readingDirection === 'rtl'
                    ? (pages[pages.length - readProgress?.page]?.path ?? '')
                    : (pages[readProgress?.page - 1]?.path ?? '')
                ) ?? ''
              }
              visible={zoomVisible}
            />
          )}
          {readingMode === 'vertical' ? (
            <div className="h-full relative">
              <div
                ref={setScrollContainer}
                className="h-full overflow-y-auto"
                style={{
                  scrollBehavior: 'smooth'
                }}
              >
                <div className="flex flex-col">
                  {!!pages.length &&
                    (readingDirection === 'rtl' ? [...pages].reverse() : pages)?.map((page) => (
                      <div
                        key={page.path}
                        className="w-full shrink-0 overflow-hidden flex justify-center items-center"
                        style={{
                          height: `${scrollContainer?.clientHeight || window.innerHeight}px`
                        }}
                      >
                        <Image
                          className="w-full h-full object-contain"
                          src={page.path}
                          lazy
                          placeholderSrc={loading}
                          placeholderClassName="w-1/4"
                        />
                      </div>
                    ))}
                </div>
              </div>
              <div className="absolute inset-0 pointer-events-none">
                <button
                  className="w-full h-1/3 transition-colors duration-200 bg-transparent border-none cursor-pointer hover:bg-black/10 pointer-events-auto"
                  onClick={(e): void => {
                    e.preventDefault()
                    e.stopPropagation()
                    previousPage()
                  }}
                />
                <div className="w-full h-1/3" />
                <button
                  className="w-full h-1/3 transition-colors duration-200 bg-transparent border-none cursor-pointer hover:bg-black/10 pointer-events-auto"
                  onClick={(e): void => {
                    e.preventDefault()
                    e.stopPropagation()
                    nextPage()
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="h-full relative overflow-hidden">
              <div
                className="h-full flex transition-transform duration-300 ease-out"
                style={position}
              >
                {!!pages.length &&
                  (readingDirection === 'rtl' ? [...pages].reverse() : pages)?.map((page) => (
                    <div
                      key={page.path}
                      className="h-full w-full shrink-0 flex justify-center items-center relative"
                    >
                      <Image
                        className="w-full h-full object-contain"
                        src={page.path}
                        lazy
                        placeholderSrc={loading}
                        placeholderClassName="w-1/4"
                      />
                    </div>
                  ))}
              </div>
              {/* Fixed navigation buttons for horizontal mode */}
              <div className="absolute inset-0 w-full h-full flex justify-between pointer-events-none z-10">
                <button
                  className="w-1/3 h-full transition-colors duration-200 bg-transparent border-none cursor-pointer hover:bg-black/10 pointer-events-auto"
                  onClick={(e): void => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (readingDirection === 'rtl') {
                      nextPage()
                    } else {
                      previousPage()
                    }
                  }}
                />
                <button
                  className="w-1/3 h-full transition-colors duration-200 bg-transparent border-none cursor-pointer hover:bg-black/10 pointer-events-auto"
                  onClick={(e): void => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (readingDirection === 'rtl') {
                      previousPage()
                    } else {
                      nextPage()
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Reader Bottom Bar */}
        <ReaderBottomBar
          chapterName={chapters?.[chapterIndex]?.name || undefined}
          currentPage={readProgress?.page || 1}
          totalPages={readProgress?.totalPages || 1}
          readingMode={readingMode}
          onToggleReadingMode={toggleReadingMode}
          onPreviousChapter={() => {
            if (chapterIndex > 0) {
              navigate(`/reader/${comicId}/${chapters?.[chapterIndex - 1]?.id}`)
            }
          }}
          onNextChapter={() => {
            if (chapterIndex < (chapters?.length || 0) - 1) {
              navigate(`/reader/${comicId}/${chapters?.[chapterIndex + 1]?.id}`)
            }
          }}
          hasPreviousChapter={chapterIndex > 0}
          hasNextChapter={chapterIndex < (chapters?.length || 0) - 1}
        />
      </div>
    </Cover>
  )
}

export default Reader
