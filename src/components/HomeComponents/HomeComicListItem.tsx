import classNames from 'classnames'
import ReactHtmlParser from 'html-react-parser'
import Image from 'components/Image'
import FixFilePaths from 'functions/fixFilePaths'
import useGlobalStore from 'store/useGlobalStore'

const ComicListItem = ({
  item,
  ...props
}: { item: IComic } & Partial<React.LiHTMLAttributes<HTMLLIElement>>): JSX.Element => {
  const { activeComic, setActiveComic } = useGlobalStore()

  const active = activeComic.id === item.id

  const cover = FixFilePaths(item.cover)

  return (
    <li
      className={classNames(
        'w-full h-24 overflow-hidden flex flex-shrink-0 items-center justify-center bg-list-item relative cursor-pointer transition-colors backdrop-blur-sm',
        'hover:bg-list-item-hover hover:text-text-oposite',
        active ? '!bg-list-item-active text-text-oposite' : null
      )}
      onClick={() => setActiveComic(item)}
      {...props}
    >
      <p className="line-clamp-3 text-center p-1 flex-grow">{ReactHtmlParser(item.name)}</p>

      <Image
        className="flex-shrink-0 h-full aspect-[10/16] object-cover object-center"
        src={cover}
      />
    </li>
  )
}

export default ComicListItem
