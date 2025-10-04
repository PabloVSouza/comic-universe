import { FC } from 'react'
import Button from 'components/Button'
import openWindow from 'functions/openWindow'
import useDatabaseChangelogSync from 'hooks/useDatabaseChangelogSync'
import { downloadIcon, refreshIcon } from 'assets/index'

export const HomeComicNav: FC = () => {
  const { syncData, isSyncing } = useDatabaseChangelogSync()

  const handleSync = () => {
    console.log('Sync button clicked')
    console.log('isSyncing:', isSyncing)
    console.log('syncData function:', typeof syncData)
    // Use database changelog-based sync
    syncData()
  }

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
          className="z-30 h-full p-2"
          icon={refreshIcon}
          size="xs"
          theme="pure"
          onClick={handleSync}
          disabled={isSyncing}
          loading={isSyncing}
          loadingAnimation="spin-reverse"
        />
      </li>
    </ul>
  )
}
