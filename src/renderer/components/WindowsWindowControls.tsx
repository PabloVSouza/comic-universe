import React from 'react'

interface WindowsWindowControlsProps {
  className?: string
}

const WindowsWindowControls: React.FC<WindowsWindowControlsProps> = ({ className = '' }) => {
  const handleMinimize = () => {
    window.Electron?.minimizeWindow?.()
  }

  const handleMaximize = () => {
    window.Electron?.maximizeWindow?.()
  }

  const handleClose = () => {
    window.Electron?.closeWindow?.()
  }

  return (
    <div className={`flex items-center ${className}`}>
      <button
        onClick={handleMinimize}
        className="w-12 h-8 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
        title="Minimize"
      >
        <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
          <rect width="10" height="1" />
        </svg>
      </button>

      <button
        onClick={handleMaximize}
        className="w-12 h-8 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
        title="Maximize"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <rect
            width="9"
            height="9"
            x="0.5"
            y="0.5"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </button>

      <button
        onClick={handleClose}
        className="w-12 h-8 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors duration-200"
        title="Close"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <path d="M0 0L10 10M10 0L0 10" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
    </div>
  )
}

export default WindowsWindowControls
