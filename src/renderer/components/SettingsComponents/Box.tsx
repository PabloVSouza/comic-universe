import { ReactNode } from 'react'

interface SettingsBoxProps {
  children: ReactNode
  className?: string
}

const SettingsBox = ({ children, className = '' }: SettingsBoxProps) => {
  return (
    <div
      className={`bg-default backdrop-blur-sm rounded-lg p-6 border border-gray-200/50 dark:border-gray-600/50 ${className}`}
    >
      {children}
    </div>
  )
}

export default SettingsBox
