import { useQuery } from '@tanstack/react-query'
import { useApi } from 'hooks'
import { usePersistSessionStore } from 'store'
import { Item } from 'components/SettingsComponents'
import { DisplayValue } from 'components/UiComponents'

const UserStatistics = () => {
  const { invoke } = useApi()
  const { currentUser } = usePersistSessionStore()

  const { data: readProgress } = useQuery({
    queryKey: ['userReadProgress', currentUser.id],
    queryFn: async () => {
      if (currentUser.id) {
        return await invoke<Array<{ page: number }>>('dbGetReadProgressByUser', {
          userId: currentUser.id
        })
      }
      return []
    },
    enabled: !!currentUser.id,
    initialData: []
  })

  const totalChaptersRead = readProgress?.length || 0
  const totalPagesRead = readProgress?.reduce((sum, progress) => sum + progress.page, 0) || 0

  return (
    <div className="flex flex-col gap-6">
      <Item
        labelI18nKey="Settings.user.chaptersRead"
        descriptionI18nKey="Settings.user.chaptersReadDescription"
      >
        <DisplayValue>{totalChaptersRead}</DisplayValue>
      </Item>

      <Item
        labelI18nKey="Settings.user.pagesRead"
        descriptionI18nKey="Settings.user.pagesReadDescription"
      >
        <DisplayValue>{totalPagesRead}</DisplayValue>
      </Item>
    </div>
  )
}

export default UserStatistics
