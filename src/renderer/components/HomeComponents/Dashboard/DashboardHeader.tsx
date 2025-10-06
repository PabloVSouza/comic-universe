import { FC } from 'react'
import { FixFilePaths } from 'functions'
import HtmlParser from 'html-react-parser'
import { Image } from 'components/ui'

type DashboardHeaderProps = {
  comic: IComic
}

const DashboardHeader: FC<DashboardHeaderProps> = ({ comic }) => {
  const cover = FixFilePaths(comic.cover)

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

export default DashboardHeader
