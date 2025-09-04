import { useState, useEffect } from 'react'

interface DebugLog {
  id: number
  timestamp: string
  message: string
}

let logCounter = 0
const debugLogs: DebugLog[] = []
const logListeners: ((logs: DebugLog[]) => void)[] = []

// Global debug logger
export const addGlobalDebugLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  const log: DebugLog = {
    id: ++logCounter,
    timestamp,
    message
  }
  
  debugLogs.push(log)
  // Keep only last 50 logs
  if (debugLogs.length > 50) {
    debugLogs.shift()
  }
  
  // Notify all listeners
  logListeners.forEach(listener => listener([...debugLogs]))
  
  // Also log to browser console
  console.log(`[${timestamp}] ${message}`)
}

const DebugConsole = () => {
  const [logs, setLogs] = useState<DebugLog[]>(debugLogs)
  const [isVisible, setIsVisible] = useState(true)
  const [height, setHeight] = useState(200) // Default height in pixels
  const [isResizing, setIsResizing] = useState(false)

  useEffect(() => {
    // Register this component as a listener
    const updateLogs = (newLogs: DebugLog[]) => setLogs(newLogs)
    logListeners.push(updateLogs)
    
    // Initial debug message
    addGlobalDebugLog('🚀 Global Debug Console initialized')
    
    return () => {
      // Remove listener on unmount
      const index = logListeners.indexOf(updateLogs)
      if (index > -1) {
        logListeners.splice(index, 1)
      }
    }
  }, [])

  // F12 shortcut to toggle console
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F12') {
        event.preventDefault()
        setIsVisible(prev => {
          const newState = !prev
          addGlobalDebugLog(`🔧 Console ${newState ? 'shown' : 'hidden'} via F12`)
          return newState
        })
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    e.preventDefault()
    
    const startY = e.clientY
    const startHeight = height
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = startY - e.clientY
      const newHeight = Math.max(100, Math.min(400, startHeight + deltaY))
      setHeight(newHeight)
    }
    
    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const copyLogs = () => {
    const logText = logs.map(log => `[${log.timestamp}] ${log.message}`).join('\n')
    navigator.clipboard.writeText(logText).then(() => {
      addGlobalDebugLog('📋 Logs copied to clipboard!')
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = logText
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      addGlobalDebugLog('📋 Logs copied to clipboard!')
    })
  }

  const clearLogs = () => {
    debugLogs.length = 0
    setLogs([])
    addGlobalDebugLog('🧹 Debug console cleared')
  }

  if (!isVisible) {
    return null // Completely hidden - no UI when not visible
  }

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-600"
      style={{ height: `${height}px` }}
    >
      {/* Resize Handle */}
      <div
        className={`w-full h-2 bg-gray-700 cursor-ns-resize hover:bg-gray-600 flex items-center justify-center ${
          isResizing ? 'bg-blue-600' : ''
        }`}
        onMouseDown={handleMouseDown}
      >
        <div className="w-8 h-1 bg-gray-500 rounded"></div>
      </div>
      
      {/* Header */}
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-600">
        <div className="flex items-center gap-3">
          <span className="text-yellow-400 text-sm font-mono">🔍 Global Debug Console ({logs.length} logs)</span>
          <span className="text-gray-500 text-xs">Press F12 to toggle</span>
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
            title="Copy Logs"
            onClick={copyLogs}
          >
            📋 Copy
          </button>
          <button
            className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
            title="Clear Logs"
            onClick={clearLogs}
          >
            🧹 Clear
          </button>
          <button
            className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
            title="Hide Console (F12)"
            onClick={() => setIsVisible(false)}
          >
            ❌ Close
          </button>
        </div>
      </div>
      
      {/* Log Content */}
      <div 
        className="p-4 overflow-y-auto font-mono text-xs text-green-400"
        style={{ height: `${height - 60}px` }}
      >
        {logs.length === 0 ? (
          <div className="text-gray-500">No logs yet...</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="mb-1 select-text">
              <span className="text-blue-400">[{log.timestamp}]</span> {log.message}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default DebugConsole
