import slugify from 'slugify'
import HtmlParser from 'react-html-parser'

import Image from 'components/Image/Image'

import useDashboardStore from 'store/useDashboardStore'
import useGlobalStore from 'store/useGlobalStore'

const HomeDashboardHeader = (): JSX.Element => {
  const { appPath } = useGlobalStore()

  const { comic } = useDashboardStore()

  const cover = comic?.cover.startsWith('http')
    ? comic.cover
    : `file:///${window.path.join(
        appPath,
        'downloads',
        comic.type,
        slugify(comic.name),
        comic.cover
      )}`

  return (
    <div className="w-full h-72 shrink-0 bg-default flex">
      <div className="grow flex flex-col min-h-0">
        <div className="p-2 flex items-center flex-col [&>*]:text-center">
          <h1 className="text-2xl">{HtmlParser(comic.name)}</h1>
          {!!comic.publisher && <p className="text-xs">{comic.publisher}</p>}
          {!!comic.status && <p className="text-sm">{comic.status}</p>}
          {!!comic.genres && (
            <p className="text-sm">{!!comic.genres && JSON.parse(comic.genres).join(', ')}</p>
          )}
        </div>
        <div className="flex justify-center items-center overflow-auto p-2">
          <p className="h-full">{HtmlParser(comic.synopsis)}</p>
        </div>
      </div>
      <Image className="h-full object-fill aspect-10/16" src={cover} />
    </div>
  )
}

export default HomeDashboardHeader
