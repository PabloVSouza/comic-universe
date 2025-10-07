import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface SettingsItemProps {
  labelI18nKey?: string
  label?: string
  descriptionI18nKey?: string
  description?: string
  children: ReactNode
  className?: string
}

const SettingsItem = ({
  labelI18nKey,
  label,
  descriptionI18nKey,
  description,
  children,
  className = ''
}: SettingsItemProps) => {
  const { t } = useTranslation()

  const labelText = labelI18nKey ? t(labelI18nKey) : label
  const descriptionText = descriptionI18nKey ? t(descriptionI18nKey) : description

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex-1 pr-4">
        <label className="block text-base text-text-default">{labelText}</label>
        {descriptionText && (
          <p className="text-sm text-text-default opacity-70">{descriptionText}</p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

export default SettingsItem
