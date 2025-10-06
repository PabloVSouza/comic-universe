import { FC } from 'react'
import { downloadIcon, refreshIcon, confirmIcon } from 'assets'
import { openWindow } from 'functions'
import { useWebsiteSync } from 'hooks'
import Button from 'components/Button'

export const HomeComicNav: FC = () => {
  const { handleSync, isSyncing, showSuccess } = useWebsiteSync()

  return (
    <ul className="bg-default">
      <li className="flex justify-between items-center p-2 w-60">
        <Button
          className="z-30 h-full"
          icon={downloadIcon}
          size="xs"
          theme="pure"
          onClick={() => openWindow({ component: 'Search', props: {} })}
        />
        <Button
          className="z-30 h-full p-2 transition-all duration-500"
          icon={showSuccess ? confirmIcon : refreshIcon}
          size="xs"
          theme="pure"
          onClick={handleSync}
          disabled={isSyncing || showSuccess}
          loading={isSyncing}
          loadingAnimation="spin-reverse"
        />
      </li>
    </ul>
  )
}
