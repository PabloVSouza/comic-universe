import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from 'components/UiComponents'

interface ReaderBottomBarProps {
  chapterName?: string
  currentPage: number
  totalPages: number
  readingMode: 'horizontal' | 'vertical'
  onToggleReadingMode: () => void
}

const ReaderBottomBar: FC<ReaderBottomBarProps> = ({
  chapterName,
  currentPage,
  totalPages,
  readingMode,
  onToggleReadingMode
}) => {
  const { t } = useTranslation()

  const progressPercentage = totalPages > 0 ? (currentPage / totalPages) * 100 : 0

  return (
    <div className="w-full h-12 bg-background border-t border-border flex items-center justify-between px-4 z-50">
      {/* Left side - Chapter name */}
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-medium text-foreground truncate">
          {chapterName || t('Reader.chapter')}
        </h2>
      </div>

      {/* Center - Progress bar */}
      <div className="flex-1 max-w-xs mx-4">
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground text-center mt-1">
          {currentPage} / {totalPages}
        </div>
      </div>

      {/* Right side - Reading mode toggle */}
      <div className="flex-1 flex justify-end">
        <Button
          theme="pure"
          size="xs"
          title={t(
            `Reader.${readingMode === 'horizontal' ? 'switchToVertical' : 'switchToHorizontal'}`
          )}
          onClick={onToggleReadingMode}
          className="text-xs px-3 py-1"
        >
          {readingMode === 'horizontal' ? '📱' : '📖'}
        </Button>
      </div>
    </div>
  )
}

export default ReaderBottomBar
