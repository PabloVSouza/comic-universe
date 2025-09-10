import { useTranslation } from 'react-i18next'

interface SettingsTitleProps {
  i18nKey: string
  variant?: 'main' | 'section'
  className?: string
}

const SettingsTitle = ({ i18nKey, variant = 'section', className = '' }: SettingsTitleProps) => {
  const { t } = useTranslation()

  if (variant === 'main') {
    return (
      <div className="p-4 h-14 w-full absolute z-10 backdrop-blur-lg shadow-basic">
        <h2 className={`text-2xl text-center text-text-default ${className}`}>{t(i18nKey)}</h2>
      </div>
    )
  }

  return <h3 className={`text-xl mb-4 text-text-default ${className}`}>{t(i18nKey)}</h3>
}

export default SettingsTitle
