import { useTranslation } from 'react-i18next'
import Button from 'components/Button'

interface ReaderBottomBarProps {
  chapterName?: string
  currentPage: number
  totalPages: number
  readingMode: 'horizontal' | 'vertical'
  readingDirection: 'ltr' | 'rtl'
  onToggleReadingMode: () => void
  onToggleReadingDirection: () => void
  onPreviousChapter?: () => void
  onNextChapter?: () => void
  hasPreviousChapter?: boolean
  hasNextChapter?: boolean
}

const ReaderBottomBar = ({
  chapterName,
  currentPage,
  totalPages,
  readingMode,
  readingDirection,
  onToggleReadingMode,
  onToggleReadingDirection,
  onPreviousChapter,
  onNextChapter,
  hasPreviousChapter = false,
  hasNextChapter = false
}: ReaderBottomBarProps): React.JSX.Element => {
  const { t } = useTranslation()

  const progressPercentage = totalPages > 0 ? (currentPage / totalPages) * 100 : 0

  return (
    <div className="w-full h-16 bg-background/95 backdrop-blur-sm border-t border-border flex items-center justify-between px-4 z-50">
      {/* Left side - Chapter navigation */}
      <div className="flex items-center gap-2">
        <Button
          theme="navigation"
          disabled={!hasPreviousChapter}
          onClick={onPreviousChapter}
          className="text-sm"
        >
          ← {t('Reader.previousChapter')}
        </Button>
        {chapterName && <div className="text-lg text-text-default">{chapterName}</div>}
      </div>

      {/* Center - Progress bar and page info */}
      <div className="flex-1 max-w-md mx-4">
        <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-3 mb-1">
          <div
            className="bg-blue-500 dark:bg-blue-400 h-3 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="text-base text-text-default text-center">
          {currentPage} / {totalPages}
        </div>
      </div>

      {/* Right side - Reading controls and next chapter */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-base text-text-default">{t('Reader.verticalReading')}</span>
          <Button
            theme="toggle"
            active={readingMode === 'vertical'}
            title={t(
              `Reader.${readingMode === 'horizontal' ? 'switchToVertical' : 'switchToHorizontal'}`
            )}
            onClick={onToggleReadingMode}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base text-text-default">{t('Reader.rightToLeft')}</span>
          <Button
            theme="toggle"
            active={readingDirection === 'rtl'}
            title={t(
              `Reader.${readingDirection === 'ltr' ? 'switchToRtl' : 'switchToLtr'}`
            )}
            onClick={onToggleReadingDirection}
          />
        </div>
        <Button
          theme="navigation"
          disabled={!hasNextChapter}
          onClick={onNextChapter}
          className="text-sm"
        >
          {t('Reader.nextChapter')} →
        </Button>
      </div>
    </div>
  )
}

export default ReaderBottomBar
