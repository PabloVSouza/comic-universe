import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from 'components/Button'
import SlideUpMenu, { TSlideUpMenuOption } from 'components/SlideUpMenu'
import settingsIcon from 'assets/settings.svg'

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
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const progressPercentage = totalPages > 0 ? (currentPage / totalPages) * 100 : 0

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const menuOptions: TSlideUpMenuOption[] = [
    {
      title: t('Reader.verticalReading'),
      isActive: readingMode === 'vertical',
      action: onToggleReadingMode
    },
    {
      title: t('Reader.rightToLeft'),
      isActive: readingDirection === 'rtl',
      action: onToggleReadingDirection
    }
  ]

  return (
    <div className="w-full h-16 bg-background/95 backdrop-blur-sm border-t border-border flex items-center justify-between px-4 z-50">
      {/* Left side - Chapter navigation */}
      <div className="flex items-center">
        <Button
          theme="navigation"
          disabled={!hasPreviousChapter}
          onClick={onPreviousChapter}
          className="text-sm"
        >
          ← {t('Reader.previousChapter')}
        </Button>
      </div>

      {/* Center - Chapter info and progress */}
      <div className="flex-1 max-w-md mx-4 flex flex-col justify-center">
        {chapterName && (
          <div className="text-sm text-text-default text-center mb-1 truncate">
            {chapterName}
          </div>
        )}
        <div className="relative">
          <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-6 flex items-center">
            <div
              className="bg-blue-500 dark:bg-blue-400 h-6 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${progressPercentage}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white drop-shadow-sm">
              {currentPage} / {totalPages}
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Reading controls menu and next chapter */}
      <div className="flex items-center gap-3">
        <Button
          theme="pure"
          onClick={toggleMenu}
          icon={settingsIcon}
          size="xxs"
          title={t('Reader.readingSettings')}
        />
        <Button
          theme="navigation"
          disabled={!hasNextChapter}
          onClick={onNextChapter}
          className="text-sm"
        >
          {t('Reader.nextChapter')} →
        </Button>
      </div>

      {/* Slide-up menu */}
      <SlideUpMenu options={menuOptions} isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  )
}

export default ReaderBottomBar
